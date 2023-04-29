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

import { debug } from "@actions/core";
import {
  commitTypes,
  defaultCommitType,
  includeCommitLinks,
  includePRLinks,
  mentionAuthors,
  octokit,
  parseCommitMessage,
  repository,
  sha,
} from "./utils/index.js";

interface TypeGroupI {
  scopes: ScopeGroupI[];
  type: string;
}

interface ScopeGroupI {
  logs: LogI[];
  scope: string;
}

interface LogI {
  description: string;
  references: string[];
}

function trim<T extends string | undefined>(value: T): T {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (value == null) return value;

  return value.trim().replace(/ {2,}/g, " ") as never;
}

function unique(value: string[]): string[] {
  return [...new Set(value)];
}

function sortBy<T>(array: T[], property: keyof T): T[] {
  return array.sort((a, b) => (a[property] as string).localeCompare(b[property] as string));
}

export async function generateChangelog(lastSha?: string): Promise<string> {
  const { paginate, rest } = octokit();
  const { owner, repo, url } = repository();
  const defaultType = defaultCommitType();
  const typeMap = commitTypes();

  const iterator = paginate.iterator(
    rest.repos.listCommits,
    {
      per_page: 100,
      sha     : sha(),
      owner,
      repo,
    },
  );

  const typeGroups: TypeGroupI[] = [];

  paginator: for await (const { data } of iterator) {
    for (const commit of data) {
      if (commit.sha === lastSha) break paginator;

      const message = commit.commit.message.split("\n")[0];

      debug(`commit message -> ${ message }`);

      let { type, scope, description, pr, flag } = parseCommitMessage(message);

      if (!description) continue;

      description = trim(description);

      flag = trim(flag);

      if (flag === "ignore") continue;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      type = typeMap[trim(type ?? "")] ?? defaultType;

      let typeGroup = typeGroups.find(record => record.type === type);

      if (typeGroup == null) {
        typeGroup = {
          type,
          scopes: [],
        };

        typeGroups.push(typeGroup);
      }

      scope = trim(scope ?? "");

      let scopeGroup = typeGroup.scopes.find(record => record.scope === scope);

      if (scopeGroup == null) {
        scopeGroup = {
          scope,
          logs: [],
        };

        typeGroup.scopes.push(scopeGroup);
      }

      let log = scopeGroup.logs.find(record => record.description === description);

      if (log == null) {
        log = {
          description,
          references: [],
        };

        scopeGroup.logs.push(log);
      }

      const reference: string[] = [];

      if (pr && includePRLinks()) reference.push(`${ url }/issues/${ pr }`);

      if (includeCommitLinks()) reference.push(`${ url }/commit/${ commit.sha }`);

      if (commit.author?.login && mentionAuthors()) reference.push(`by @${ commit.author.login }`);

      if (reference.length > 0) log.references.push(reference.join(" "));
    }
  }

  const types = unique(Object.values(typeMap).concat(defaultType));

  const changelog: string[] = [];

  for (const type of types) {
    const typeGroup = typeGroups.find(log => log.type === type);

    if (typeGroup == null) continue;

    changelog.push(`## ${ type }`);

    sortBy(typeGroup.scopes, "scope");

    for (const { scope, logs } of typeGroup.scopes) {
      let prefix = "";

      if (scope.length > 0) {
        changelog.push(`* **${ scope }:**`);

        prefix = "  ";
      }

      for (const { description, references } of logs) {
        let line = `${ prefix }* ${ description }`;

        if (references.length > 0) line += ` (${ references.join(", ") })`;

        changelog.push(line);
      }
    }

    changelog.push("");
  }

  return changelog.join("\n");
}

export interface ChangelogRecordI {
  description: string;
  references: string[];
  scope: string;
  type: string;
}
