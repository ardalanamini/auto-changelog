/*
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
 *
 */

import { CommitNode } from "./commit.js";
import { Node } from "./node.js";

export class ScopeNode extends Node {

  protected readonly commits = (new Map<string, CommitNode>);

  public constructor(public readonly scope = "") {
    super();
  }

  public addCommit(message: string, breaking = false): CommitNode {
    const { commits } = this;

    const key = `${ message } ${ breaking }`;

    if (commits.has(key)) return commits.get(key)!;

    const commit = new CommitNode(message, breaking);

    commits.set(key, commit);

    return commit;
  }

  public print(prefix = ""): string | null {
    const { scope, commits } = this;

    if (commits.size === 0) return null;

    const parts: string[] = [];

    if (scope) {
      parts.push(`${ prefix }* **${ scope }:**`);

      prefix += "  ";
    }

    for (const commit of commits.values()) parts.push(commit.print(prefix));

    return parts.join("\n");
  }

}
