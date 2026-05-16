/**
 * MIT License
 *
 * Copyright (c) 2026 Ardalan Amini
 */

/* eslint-disable no-await-in-loop -- workspace detection walks filesystem candidates in deterministic order */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- monorepo config files are external JSON/YAML */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  type MonorepoDetector,
  includeRootCommits,
  monorepoDetectors,
  packageName as packageNameInput,
} from "#inputs";
import { type MonorepoContext, type MonorepoPackage, normalizePackagePath } from "./package.js";
import { getPackageTagPrefix } from "./tags.js";

interface PackageJson {
  name?: string;

  workspaces?: string[] | {
    packages?: string[];
  };
}

interface PnpmWorkspace {
  packages?: string[];
}

interface LernaJson {
  packages?: string[];
}

interface NxProjectConfig {
  name?: string;

  projects?: Record<string, string | {
    root?: string;
  }>;

  root?: string;
}

const AUTO_DETECTORS: Array<Exclude<MonorepoDetector, "auto">> = ["pnpm", "npm", "lerna", "nx"];

async function fileExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);

    return stats.isFile();
  } catch {
    return false;
  }
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);

    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readPackageName(root: string, packagePath: string): Promise<string | null> {
  const packageJson = await readJsonFile<PackageJson>(join(root, packagePath, "package.json"));

  return packageJson?.name ?? null;
}

function uniquePackages(packages: MonorepoPackage[]): MonorepoPackage[] {
  const seen = new Set<string>();
  const result: MonorepoPackage[] = [];

  for (const monorepoPackage of packages) {
    const key = `${ monorepoPackage.name }\u0000${ monorepoPackage.path }`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(monorepoPackage);
  }

  return result;
}

function normalizeWorkspacePatterns(patterns: string[]): string[] {
  return patterns
    .map(pattern => normalizePackagePath(pattern.trim()))
    .filter(pattern => pattern && !pattern.startsWith("!"));
}

function globToRegExp(pattern: string): RegExp {
  const parts = pattern.split("/");
  let source = "^";

  for (const [index, part] of parts.entries()) {
    if (index > 0) source += "/";

    if (part === "**") {
      source += ".*";
      continue;
    }

    source += part
      .replaceAll(/[|\\{}()[\]^$+?.]/gu, String.raw`\$&`)
      .replaceAll("*", "[^/]*");
  }

  source += "$";

  return new RegExp(source, "u");
}

async function collectDirectories(root: string, current = ""): Promise<string[]> {
  const fullPath = join(root, current);
  const entries = await readdir(fullPath, { withFileTypes: true });
  const directories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === ".git" || entry.name === "node_modules") continue;

    const child = normalizePackagePath(join(current, entry.name));
    directories.push(child);
    directories.push(...await collectDirectories(root, child));
  }

  return directories;
}

async function expandWorkspacePatterns(root: string, patterns: string[]): Promise<string[]> {
  const normalizedPatterns = normalizeWorkspacePatterns(patterns);
  const directories = await collectDirectories(root);
  const packagePaths = new Set<string>();

  for (const pattern of normalizedPatterns) {
    if (!pattern.includes("*")) {
      if (await directoryExists(join(root, pattern))) packagePaths.add(pattern);
      continue;
    }

    const regex = globToRegExp(pattern);

    for (const directory of directories) if (regex.test(directory)) packagePaths.add(directory);
  }

  const result: string[] = [];

  for (const packagePath of packagePaths) {
    const packageJsonPath = join(root, packagePath, "package.json");

    if (await fileExists(packageJsonPath)) result.push(packagePath);
  }

  return result.toSorted((a, b) => a.localeCompare(b));
}

async function packagesFromWorkspacePatterns(root: string, patterns: string[]): Promise<MonorepoPackage[]> {
  const packages: MonorepoPackage[] = [];

  for (const packagePath of await expandWorkspacePatterns(root, patterns)) {
    const name = await readPackageName(root, packagePath);

    if (!name) continue;

    packages.push({
      name,
      path: packagePath,
    });
  }

  return packages;
}

async function detectPnpmPackages(root: string): Promise<MonorepoPackage[]> {
  const workspacePath = join(root, "pnpm-workspace.yaml");

  if (!await fileExists(workspacePath)) return [];

  const workspace = parseYaml(await readFile(workspacePath, "utf8")) as PnpmWorkspace | null;

  return packagesFromWorkspacePatterns(root, workspace?.packages ?? []);
}

async function detectPackageJsonWorkspacePackages(root: string): Promise<MonorepoPackage[]> {
  const packageJson = await readJsonFile<PackageJson>(join(root, "package.json"));
  const workspaces = packageJson?.workspaces;

  if (Array.isArray(workspaces)) return packagesFromWorkspacePatterns(root, workspaces);

  return packagesFromWorkspacePatterns(root, workspaces?.packages ?? []);
}

async function detectLernaPackages(root: string): Promise<MonorepoPackage[]> {
  const lernaJsonPath = join(root, "lerna.json");

  if (!await fileExists(lernaJsonPath)) return [];

  const lernaJson = await readJsonFile<LernaJson>(lernaJsonPath);

  return packagesFromWorkspacePatterns(root, lernaJson?.packages ?? ["packages/*"]);
}

async function packageFromProjectRoot(
  root: string,
  projectRoot: string,
  fallbackName?: string,
): Promise<MonorepoPackage | null> {
  const normalizedRoot = normalizePackagePath(projectRoot);
  const packageJsonName = await readPackageName(root, normalizedRoot);
  const name = packageJsonName ?? fallbackName;

  if (!name) return null;

  return {
    name,
    path: normalizedRoot,
  };
}

async function detectNxProjectsFile(root: string, fileName: string): Promise<MonorepoPackage[]> {
  const config = await readJsonFile<NxProjectConfig>(join(root, fileName));
  const projects = config?.projects;
  const result: MonorepoPackage[] = [];

  if (!projects) return result;

  for (const [name, project] of Object.entries(projects)) {
    const projectRoot = typeof project === "string" ? project : project.root;

    if (!projectRoot) continue;

    const monorepoPackage = await packageFromProjectRoot(root, projectRoot, name);

    if (monorepoPackage) result.push(monorepoPackage);
  }

  return result;
}

async function detectProjectJsonPackages(root: string): Promise<MonorepoPackage[]> {
  const result: MonorepoPackage[] = [];

  for (const directory of await collectDirectories(root)) {
    const projectJsonPath = join(root, directory, "project.json");

    if (!await fileExists(projectJsonPath)) continue;

    const projectJson = await readJsonFile<NxProjectConfig>(projectJsonPath);
    const monorepoPackage = await packageFromProjectRoot(root, directory, projectJson?.name);

    if (monorepoPackage) result.push(monorepoPackage);
  }

  return result;
}

async function detectNxPackages(root: string): Promise<MonorepoPackage[]> {
  return uniquePackages([
    ...await detectNxProjectsFile(root, "workspace.json"),
    ...await detectNxProjectsFile(root, "angular.json"),
    ...await detectProjectJsonPackages(root),
  ]);
}

async function detectPackagesForDetector(
  root: string,
  detector: Exclude<MonorepoDetector, "auto">,
): Promise<MonorepoPackage[]> {
  switch (detector) {
    case "pnpm":
      return detectPnpmPackages(root);

    case "npm":
    case "yarn":
      return detectPackageJsonWorkspacePackages(root);

    case "lerna":
      return detectLernaPackages(root);

    case "nx":
      return detectNxPackages(root);

    default:
      return [];
  }
}

function expandDetectors(detectors: MonorepoDetector[]): Array<Exclude<MonorepoDetector, "auto">> {
  if (detectors.includes("auto")) return AUTO_DETECTORS;

  return detectors.filter(detector => detector !== "auto");
}

export async function detectMonorepoContext(root = process.cwd()): Promise<MonorepoContext | null> {
  const selectedPackageName = packageNameInput();

  if (!selectedPackageName) return null;

  const detectors = expandDetectors(monorepoDetectors());
  const packageDetections = detectors.map(async detector => detectPackagesForDetector(root, detector));
  const detectedPackages = await Promise.all(packageDetections);
  const packages = uniquePackages(detectedPackages.flat());

  const selectedPackage = packages.find(monorepoPackage => monorepoPackage.name === selectedPackageName);

  if (!selectedPackage) {
    const names = packages.map(monorepoPackage => monorepoPackage.name).toSorted((a, b) => a.localeCompare(b));
    const suffix = names.length > 0
      ? ` Detected packages: ${ names.join(", ") }.`
      : " No packages were detected.";

    throw new Error(`Could not find monorepo package "${ selectedPackageName }".${ suffix }`);
  }

  return {
    includeRootCommits: includeRootCommits(),
    packages,
    selectedPackage   : {
      name: selectedPackage.name,
      path: normalizePackagePath(relative(root, join(root, selectedPackage.path))),
    },
    tagPrefix: getPackageTagPrefix(selectedPackage.name),
  };
}
