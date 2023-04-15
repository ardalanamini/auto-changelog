import { GitHub } from "@actions/github/lib/utils";
import { SemVer } from "semver";

export const COMMIT_REGEX
  = /^(?<type>[^:()]*)(?:\((?<category>[^()]*?)\)|): *(?<title>.+?) *(?:\(#(?<pr>[1-9]\d*?)\)|) *(?:\[(?<flag>[^[\]]*?)]|)\s*$/;

export const APP_AUTHOR_SUFFIX = "[bot]";

export const APP_AUTHOR_SUFFIX_LENGTH = APP_AUTHOR_SUFFIX.length;

export type TypesI = Record<string, string>;

export type LogsI = Record<string, Record<string, LogI[] | undefined> | undefined>;

export interface LogI {
  references: ReferenceI[];
  title: string;
}

export interface ReferenceI {
  author?: string | null;
  commit: string | null;
  pr?: string | null;
}

export interface TagInputI {
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  prerelease: boolean;
  repo: string;
  semver: SemVer | null;
  sha: string;
}

export interface TagResultI {
  name?: string;
  sha?: string;
}

export interface ChangelogInputI {
  inputs: ActionInputsI;
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  repo: string;
  sha: string;
  tagRef?: string;
}

export interface ActionInputsI {
  commitTypes: TypesI;
  defaultCommitType: string;
  includeCommitLinks: boolean;
  includeCompare: boolean;
  includePRLinks: boolean;
  mentionAuthors: boolean;
  mentionNewContributors: boolean;
  releaseName: string;
  semver: boolean;
}
