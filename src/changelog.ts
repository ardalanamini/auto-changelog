/**
 * MIT License
 *
 * Copyright (c) 2020-2025 Ardalan Amini
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

import { debug } from "@actions/core";
import { ChangelogNode } from "./nodes/index.js";
import { iterateCommits, parseCommitMessage, repository, trim } from "./utils/index.js";

export async function generateChangelog(lastSha?: string): Promise<string> {
  const { owner, repo } = repository();

  const changelogNode = (new ChangelogNode);

  for await (const commit of iterateCommits(owner, repo, lastSha)) {
    const message = commit.commit.message.split("\n")[0];

    debug(`commit message -> ${ message }`);

    let { type, scope, description, pr, flag, breaking } = parseCommitMessage(message);

    if (!description) continue;

    description = trim(description);

    flag = trim(flag);

    if (flag === "ignore") continue;

    const typeNode = changelogNode.addType(type);

    const scopeNode = typeNode.addScope(scope);

    const commitNote = scopeNode.addCommit(description, breaking);

    const authorNode = commitNote.addAuthor(commit.author?.login);

    authorNode.addReference(commit.sha, pr);
  }

  const changelog = changelogNode.print();

  if (changelog) return `${ changelog }\n`;

  return "";
}
