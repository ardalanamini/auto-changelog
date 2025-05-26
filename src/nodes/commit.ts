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

import { CommitAuthorNode } from "./commit-author.js";
import { Node } from "./node.js";

/**
 * Represents a commit node in a data structure that tracks commit information.
 * Extends the `Node` class and contains additional metadata such as description,
 * authors, and a flag indicating whether the commit introduces breaking changes.
 */
export class CommitNode extends Node {

  protected readonly authors: CommitAuthorNode[] = [];

  /**
   * Constructs an instance of the class.
   *
   * @param description - A description of the instance.
   * @param [breaking=false] - Indicates whether the instance represents a breaking change.
   */
  public constructor(public readonly description: string, public readonly breaking = false) {
    super();
  }

  /**
   * Adds a new author or retrieves the previous author if the username matches the last one.
   *
   * @param [username] - The username of the author to add.
   * @returns The added or retrieved author node instance.
   */
  public addAuthor(username?: string): CommitAuthorNode {
    const { authors } = this;

    // Only reuse authors with known usernames.
    if (username && authors.length > 0) {
      // Only if the last reference is to the same author, reuse the node.
      const previousAuthor = authors[authors.length - 1];

      if (previousAuthor.username === username) return previousAuthor;
    }

    const author = new CommitAuthorNode(username);

    authors.push(author);

    return author;
  }

  /**
   * Constructs and returns a formatted string representation of the commit.
   *
   * @param [prefix=""] - A string to prefix the formatted output with.
   * @returns A formatted string containing the description, authors, and a breaking indicator if applicable.
   */
  public print(prefix = ""): string {
    const { breaking, description, authors } = this;

    const parts: string[] = [];

    if (breaking) parts.push("***BREAKING:***");

    parts.push(description);

    if (authors.length > 0) {
      const references: string[] = [];

      for (const author of authors) {
        const printedAuthor = author.print();

        if (printedAuthor) references.push(printedAuthor);
      }

      if (references.length > 0) parts.push(`(${ references.join(", ") })`);
    }

    return `${ prefix }* ${ parts.join(" ") }`;
  }

}
