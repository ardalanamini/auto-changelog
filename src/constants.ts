import type { GitHub } from "@actions/github/lib/utils";
import type { SemVer } from "semver";

export const COMMIT_REGEX =
  /^(?<type>[^)]*)(?:\((?<category>[^)]*?)\)|): *(?<title>.+?) *(?:\(#(?<pr>[1-9]\d*?)\)|) *(?:\[(?<flag>[^\]]+?)]|)\s*$/;

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
  references: ReferenceI[];
}

export interface ReferenceI {
  commit: string;
  pr?: string;
}

export interface TagInputI {
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  repo: string;
  sha: string;
  semver: SemVer | null;
  prerelease: boolean;
}

export interface TagResultI {
  sha?: string;
  name?: string;
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
  releaseName: string;
  mentionNewContributors: boolean;
  includeCompare: boolean;
  semver: boolean;
}
