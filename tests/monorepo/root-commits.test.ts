import { expect, it } from "@jest/globals";
import { type MonorepoContext, shouldIncludeCommit } from "#monorepo";

const context: MonorepoContext = {
  includeRootCommits: "false",
  packages          : [
    {
      name: "web",
      path: "apps/web",
    },
    {
      name: "api",
      path: "apps/api",
    },
  ],
  selectedPackage: {
    name: "web",
    path: "apps/web",
  },
  tagPrefix: "web@",
};

it("should include selected package commits", () => {
  expect(shouldIncludeCommit(["apps/web/src/index.ts"], context)).toBe(true);
});

it("should exclude sibling-only commits", () => {
  expect(shouldIncludeCommit(["apps/api/src/index.ts"], {
    ...context,
    includeRootCommits: "all",
  })).toBe(false);
});

it("should exclude root commits when include-root-commits is false", () => {
  expect(shouldIncludeCommit(["package.json"], context)).toBe(false);
});

it("should include allowlisted root commits when include-root-commits is auto", () => {
  expect(shouldIncludeCommit(["package.json"], {
    ...context,
    includeRootCommits: "auto",
  })).toBe(true);
  expect(shouldIncludeCommit(["README.md"], {
    ...context,
    includeRootCommits: "auto",
  })).toBe(false);
});

it("should include all non-package root/shared commits when include-root-commits is all", () => {
  expect(shouldIncludeCommit(["README.md"], {
    ...context,
    includeRootCommits: "all",
  })).toBe(true);
});
