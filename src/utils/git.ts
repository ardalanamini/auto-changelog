/**
 * MIT License
 *
 * Copyright (c) 2025 Ardalan Amini
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
 */

import { promisify } from "node:util";
import { rsort, valid } from "semver";
import {
  type DefaultLogFields,
  type ListLogLine,
  type LogOptions,
  type LogResult,
  type TagResult,
  type TaskOptions,
  simpleGit,
} from "simple-git";

const git = simpleGit();

const tags = promisify<TaskOptions, TagResult>(git.tags);

const log = promisify<TaskOptions | LogOptions, LogResult>(git.log);

const diff = promisify<TaskOptions, string>(git.diff);

export async function listTags(semver = false): Promise<string[]> {
  let { all } = await tags.call(git, ["--sort=-creatordate"]);

  if (semver) {
    all = all.filter(tag => valid(tag));

    all = rsort(all);
  }

  return all;
}

export async function listCommits(to?: string, from?: string): Promise<ReadonlyArray<DefaultLogFields & ListLogLine>> {
  const { all } = await log.call(git, {
    from,
    to,
  });

  return all;
}

export async function listChanges(hash: string): Promise<string[]> {
  const result = await diff.call(git, ["--name-only", `${ hash }~1`, hash]);

  return result.trim().split("\n");
}
