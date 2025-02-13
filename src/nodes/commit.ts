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

import { CommitAuthorNode } from "./commit-author.js";
import { Node } from "./node.js";

export class CommitNode extends Node {

  protected readonly authors: CommitAuthorNode[] = [];

  public constructor(public readonly description: string, public readonly breaking: boolean) {
    super();
  }

  public addAuthor(username: string): CommitAuthorNode {
    const { authors } = this;

    if (authors.length > 0) {
      const previousAuthor = authors[authors.length - 1];

      if (previousAuthor.username === username) return previousAuthor;
    }

    const author = new CommitAuthorNode(username);

    authors.push(author);

    return author;
  }

  public print(prefix = ""): string {
    const { breaking, description, authors } = this;

    const parts: string[] = [];

    if (breaking) parts.push("***breaking:***");

    parts.push(description);

    if (authors.length > 0) {
      const references: string[] = [];

      for (const author of authors) references.push(author.print());

      parts.push(`(${ references.join(", ") })`);
    }

    return `${ prefix }* ${ parts.join(" ") }`;
  }

}
