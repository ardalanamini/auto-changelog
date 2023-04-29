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

import { type SemVer } from "semver";
import { octokit, parseSemVer, releaseName, repository, semver, sha } from "./utils/index.js";

export interface TagInfoI {
  prerelease: boolean;

  previous?: {
    name: string;
    sha: string;
  };

  releaseId: string;
}

export async function getTagInfo(): Promise<TagInfoI> {
  const { paginate, rest } = octokit();
  const { owner, repo } = repository();

  const info: TagInfoI = {
    releaseId : "latest",
    prerelease: false,
  };

  let semVer: SemVer | null = null;

  if (semver()) {
    semVer = parseSemVer();

    if (semVer == null) throw new Error(`Expected a semver compatible releaseName, got "${ releaseName() }" instead.`);

    info.prerelease = semVer.prerelease.length > 0;

    if (info.prerelease) info.releaseId = `${ semVer.prerelease[0] }`;
  }

  const iterator = paginate.iterator(
    rest.repos.listTags,
    {
      per_page: 100,
      owner,
      repo,
    },
  );

  loop: for await (const { data } of iterator) {
    for (const { name, commit } of data) {
      if (sha() === commit.sha) continue;

      if (semVer == null) {
        info.previous = {
          name,
          sha: commit.sha,
        };

        break loop;
      }

      const version = parseSemVer(name);

      if (version == null || semVer.compare(version) <= 0) continue;

      if (version.prerelease.length > 0 && !info.prerelease) continue;

      info.previous = {
        name,
        sha: commit.sha,
      };

      break loop;
    }
  }

  return info;
}
