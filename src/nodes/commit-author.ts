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

import { CommitHashNode } from "./commit-hash.js";
import { Node } from "./node.js";
import { PullRequestNode } from "./pull-request.js";

export class CommitAuthorNode extends Node {

  protected readonly references: Array<CommitHashNode | PullRequestNode> = [];

  public constructor(public readonly username: string) {
    super();
  }

  public addReference(sha: string, pr?: string): CommitHashNode | PullRequestNode {
    let reference: CommitHashNode | PullRequestNode;

    // PR references take priority over commit hash references
    if (pr) reference = new PullRequestNode(pr);
    else reference = new CommitHashNode(sha);

    this.references.push(reference);

    return reference;
  }

  public print(): string {
    const { username, references } = this;

    const mention = `@${ username }`;

    if (references.length === 0) return mention;

    const parts: string[] = [];

    for (const reference of references) parts.push(reference.print());

    return `${ parts.join(" & ") } by ${ mention }`;
  }

}
