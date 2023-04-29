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

import { parse as parseSemVer } from "semver";
import { type TagInputI, type TagResultI } from "./constants.js";

export async function getTagSha(input: TagInputI): Promise<TagResultI> {
  const { octokit, owner, repo, sha, semver, prerelease } = input;

  for await (const { data } of octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      per_page: 100,
      owner,
      repo,
    },
  )) {
    for (const {
      name,
      commit: { sha: tagSha },
    } of data) {
      if (sha === tagSha) continue;

      if (semver == null) {
        return {
          sha: tagSha,
          name,
        };
      }

      const tagSemver = parseSemVer(name, { includePrerelease: true } as never);

      if (tagSemver == null || semver.compare(tagSemver) <= 0) continue;

      if (tagSemver.prerelease.length > 0 && !prerelease) continue;

      return {
        sha: tagSha,
        name,
      };
    }
  }

  return {};
}
