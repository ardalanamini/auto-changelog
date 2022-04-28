import type { GitHub } from "@actions/github/lib/utils";
import type { SemVer } from "semver";

export const COMMIT_REGEX =
  /^(?<type>[^)]*)(?:\((?<category>[^)]*?)\)|):(?<title>.*?)(?:\[(?<flag>[^\]]+?)\]|)\s*$/;
export const PR_REGEX = /#([1-9]\d*)/g;

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

export interface TagInputI {
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  repo: string;
  sha: string;
  semver: SemVer | null;
  prerelease: boolean;
}

export interface ChangelogInputI {
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  repo: string;
  sha: string;
  tagRef?: string;
  inputs: ActionInputsI;
}

export interface ActionInputsI {
  commitTypes: TypesI;
  defaultCommitType: string;
  semver: boolean;
}
