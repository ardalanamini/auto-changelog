import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { includeRootCommits, monorepoDetectors, releaseName } from "#inputs";
import { detectMonorepoContext } from "#monorepo";

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(value), "utf8");
}

async function createPackage(root: string, packagePath: string, name: string): Promise<void> {
  await mkdir(join(root, packagePath), { recursive: true });
  await writeJson(join(root, packagePath, "package.json"), { name });
}

describe("detectMonorepoContext", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "auto-changelog-monorepo-"));

    jest.mocked(releaseName).mockReturnValue("web@1.0.0");
    jest.mocked(monorepoDetectors).mockReturnValue(["auto"]);
    jest.mocked(includeRootCommits).mockReturnValue("false");
  });

  afterEach(async () => {
    await rm(root, {
      force    : true,
      recursive: true,
    });
  });

  it("should return null when release name is not a package tag", async () => {
    jest.mocked(releaseName).mockReturnValueOnce("1.0.0");

    await expect(detectMonorepoContext(root)).resolves.toBeNull();
  });

  it("should detect pnpm workspace packages in auto mode", async () => {
    await writeFile(join(root, "pnpm-workspace.yaml"), "packages:\n  - apps/*\n", "utf8");
    await createPackage(root, "apps/web", "web");
    await createPackage(root, "apps/api", "api");

    await expect(detectMonorepoContext(root)).resolves.toEqual({
      includeRootCommits: "false",
      packages          : [
        {
          name: "api",
          path: "apps/api",
        },
        {
          name: "web",
          path: "apps/web",
        },
      ],
      selectedPackage: {
        name: "web",
        path: "apps/web",
      },
      tagPrefix: "web@",
    });
  });

  it("should detect package.json workspace packages", async () => {
    jest.mocked(monorepoDetectors).mockReturnValueOnce(["npm"]);
    jest.mocked(releaseName).mockReturnValueOnce("web@1.0.0");

    await writeJson(join(root, "package.json"), { workspaces: ["packages/*"] });
    await createPackage(root, "packages/web", "web");

    await expect(detectMonorepoContext(root)).resolves.toMatchObject({
      selectedPackage: {
        name: "web",
        path: "packages/web",
      },
    });
  });

  it("should detect lerna packages", async () => {
    jest.mocked(monorepoDetectors).mockReturnValueOnce(["lerna"]);
    jest.mocked(releaseName).mockReturnValueOnce("web@1.0.0");

    await writeJson(join(root, "lerna.json"), { packages: ["modules/*"] });
    await createPackage(root, "modules/web", "web");

    await expect(detectMonorepoContext(root)).resolves.toMatchObject({
      selectedPackage: {
        name: "web",
        path: "modules/web",
      },
    });
  });

  it("should detect nx project packages", async () => {
    jest.mocked(monorepoDetectors).mockReturnValueOnce(["nx"]);
    jest.mocked(releaseName).mockReturnValueOnce("web@1.0.0");

    await writeJson(join(root, "workspace.json"), {
      projects: {
        web: "apps/web",
      },
    });
    await createPackage(root, "apps/web", "web");

    await expect(detectMonorepoContext(root)).resolves.toMatchObject({
      selectedPackage: {
        name: "web",
        path: "apps/web",
      },
    });
  });

  it("should detect scoped package tags", async () => {
    jest.mocked(releaseName).mockReturnValueOnce("@scope/ui@1.0.0");

    await writeFile(join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n", "utf8");
    await createPackage(root, "packages/ui", "@scope/ui");

    await expect(detectMonorepoContext(root)).resolves.toMatchObject({
      selectedPackage: {
        name: "@scope/ui",
        path: "packages/ui",
      },
      tagPrefix: "@scope/ui@",
    });
  });

  it("should throw with detected package names when selected package is missing", async () => {
    jest.mocked(releaseName).mockReturnValueOnce("missing@1.0.0");

    await writeFile(join(root, "pnpm-workspace.yaml"), "packages:\n  - apps/*\n", "utf8");
    await createPackage(root, "apps/web", "web");

    await expect(detectMonorepoContext(root)).rejects.toThrow("Detected packages: web");
  });
});
