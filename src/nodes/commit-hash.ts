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

import { Node } from "./node.js";
import { includeCommitLinks } from "../inputs/index.js";

/**
 * Represents a node that holds a commit hash (SHA) and provides functionality
 * for generating formatted strings or links based on its state and the repository context.
 */
export class CommitHashNode extends Node {

  public readonly shouldNotPrint = !includeCommitLinks();

  /**
   * Constructs an instance of the commit hash node with a specified SHA string.
   *
   * @param sha - The SHA string associated with this instance.
   */
  public constructor(public readonly sha: string) {
    super();
  }

  /**
   * Generates and returns a formatted string based on the current object state.
   * If `shouldNotPrint` is true, the method returns null.
   * If `shouldUseGithubAutolink` is true, the method directly returns the `sha` value.
   * Otherwise,
   * it returns a markdown-formatted string linking to the GitHub commit URL constructed using `sha` and `repo.url`.
   *
   * @returns A formatted string, the `sha` string, or null depending on conditions.
   */
  public print(): string | null {
    const { sha, shouldUseGithubAutolink, repo, shouldNotPrint } = this;

    if (shouldNotPrint) return null;

    if (shouldUseGithubAutolink) return sha;

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return `\`[${ sha.slice(0, 7) }](${ repo.url }/commit/${ sha })\``;
  }

}
