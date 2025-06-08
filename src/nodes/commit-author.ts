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

import { mentionAuthors } from "#inputs";
import { CommitHashNode } from "./commit-hash.js";
import { Node } from "./node.js";
import { PullRequestNode } from "./pull-request.js";

/**
 * Represents a node for a commit author, containing information about the author
 * and associated references to commits or pull requests.
 */
export class CommitAuthorNode extends Node {

  public readonly shouldMentionAuthor = mentionAuthors();

  protected readonly references: Array<CommitHashNode | PullRequestNode> = [];

  /**
   * Initializes a new instance of the commit author node with an optional username.
   *
   * @param [username] - The commit author username.
   */
  public constructor(public readonly username?: string) {
    super();
  }

  /**
   * Adds a reference to either a pull request or a commit hash.
   * If a pull request is provided, it takes priority over the commit hash.
   *
   * @param sha - The SHA hash of the commit reference.
   * @param [pr] - The optional pull request identifier.
   * @returns The created reference node, either a CommitHashNode or a PullRequestNode.
   */
  public addReference(sha: string, pr?: string): CommitHashNode | PullRequestNode {
    // PR references take priority over commit hash references
    const reference = pr ? new PullRequestNode(pr) : new CommitHashNode(sha);

    // Check if a reference already exists to avoid duplicates
    for (const existingReference of this.references) {
      if (
        (!pr && existingReference instanceof CommitHashNode && existingReference.sha === sha)
        || (existingReference instanceof PullRequestNode && existingReference.pr === pr)
      ) return existingReference;
    }

    this.references.push(reference);

    return reference;
  }

  /**
   * Constructs and returns a formatted string representation based on references and author information.
   * It combines references and adds author mention if applicable.
   *
   * @returns The formatted string representation or null if no parts are available.
   */
  public print(): string | null {
    const { username, references, serverUrl, shouldMentionAuthor, shouldUseGithubAutolink } = this;

    const printedReferences: string[] = [];

    for (const reference of references) {
      const printedReference = reference.print();

      if (printedReference) printedReferences.push(printedReference);
    }

    const parts: string[] = [];

    if (printedReferences.length > 0) parts.push(printedReferences.join(" & "));

    if (shouldMentionAuthor && username) {
      if (parts.length > 0) parts.push("by");

      if (shouldUseGithubAutolink) parts.push(`@${ username }`);
      else parts.push(`[@${ username }](${ serverUrl }/${ username })`);
    }

    if (parts.length === 0) return null;

    return parts.join(" ");
  }

}
