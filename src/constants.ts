import type { GitHub } from "@actions/github/lib/utils";

export const COMMIT_REGEX =
  /^([^)]*)(?:\(([^)]*?)\)|):(.*?)(?:\[([^\]]+?)\]|)\s*$/;
export const PR_REGEX = /#([1-9]\d*)/g;

export const TYPES: TypesI = {
  breaking: "Breaking Changes",
  build: "Build System",
  ci: "Continuous Integration",
  chore: "Chores",
  deps: "Dependencies",
  docs: "Documentation Changes",
  feat: "New Features",
  fix: "Bug Fixes",
  other: "Other Changes",
  perf: "Performance Improvements",
  refactor: "Refactors",
  revert: "Reverts",
  style: "Code Style Changes",
  test: "Tests",
};

export interface TypesI {
  [type: string]: string;
}

export interface LogsI {
  [type: string]: {
    [category: string]: LogI[];
  };
}

export interface LogI {
  title: string;
  commits: string[];
}

export interface InputI {
  octokit: InstanceType<typeof GitHub>;
  exclude: string[];
  owner: string;
  repo: string;
  sha: string;
  tagRef?: string;
}
