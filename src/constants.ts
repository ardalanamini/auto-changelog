import type { GitHub } from "@actions/github/lib/utils";

export const COMMIT_REGEX =
  /^([^)]*)(?:\(([^)]*?)\)|):(.*?)(?:\[([^\]]+?)\]|)\s*$/;
export const PR_REGEX = /#([1-9]\d*)/g;

export const TYPES: TypesI = {
  breaking: "Breaking Changes",
  feat: "New Features",
  fix: "Bug Fixes",
  revert: "Reverts",
  perf: "Performance Improvements",
  refactor: "Refactors",
  deps: "Dependencies",
  docs: "Documentation Changes",
  style: "Code Style Changes",
  build: "Build System",
  ci: "Continuous Integration",
  test: "Tests",
  chore: "Chores",
  other: "Other Changes",
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
