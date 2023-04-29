/*
 * MIT License
 *
 * Copyright (c) 2020-2023 Ardalan Amini
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { type GitHub } from "@actions/github/lib/utils";
import { type SemVer } from "semver";

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
