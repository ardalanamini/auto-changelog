/**
 * MIT License
 *
 * Copyright (c) 2026 Ardalan Amini
 */

import { type MonorepoContext, type MonorepoPackage, normalizePackagePath } from "./package.js";

const AUTO_ROOT_FILE_PATTERNS = [
  /^package\.json$/u,
  /^pnpm-lock\.yaml$/u,
  /^package-lock\.json$/u,
  /^yarn\.lock$/u,
  /^bun\.lockb?$/u,
  /^pnpm-workspace\.yaml$/u,
  /^lerna\.json$/u,
  /^nx\.json$/u,
  /^turbo\.json$/u,
  /^rush\.json$/u,
  /^tsconfig(?:\..*)?\.json$/u,
  /^eslint\.config\..+$/u,
  /^jest\.config\..+$/u,
  /^vitest\.config\..+$/u,
  /^vite\.config\..+$/u,
  /^webpack\.config\..+$/u,
  /^rollup\.config\..+$/u,
  /^\.eslintrc(?:\..*)?$/u,
  /^\.prettierrc(?:\..*)?$/u,
  /^prettier\.config\..+$/u,
];

function isWithinPackage(file: string, monorepoPackage: MonorepoPackage): boolean {
  const packagePath = normalizePackagePath(monorepoPackage.path);

  return file === packagePath || file.startsWith(`${ packagePath }/`);
}

function isAutoRootFile(file: string): boolean {
  if (file.includes("/")) return false;

  return AUTO_ROOT_FILE_PATTERNS.some(pattern => pattern.test(file));
}

export function shouldIncludeFile(filePath: string, context: MonorepoContext): boolean {
  const file = normalizePackagePath(filePath);

  if (isWithinPackage(file, context.selectedPackage)) return true;

  if (context.packages.some(monorepoPackage => isWithinPackage(file, monorepoPackage))) return false;

  if (context.includeRootCommits === "false") return false;

  if (context.includeRootCommits === "auto") return isAutoRootFile(file);

  return true;
}

export function shouldIncludeCommit(files: string[], context: MonorepoContext): boolean {
  return files.some(file => shouldIncludeFile(file, context));
}
