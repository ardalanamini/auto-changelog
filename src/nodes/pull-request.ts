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

import { includePRLinks } from "../inputs/index.js";
import { Node } from "./node.js";

/**
 * Represents a node associated with a pull request or issue link.
 * This class provides functionality to generate formatted links
 * for pull requests or issues based on certain conditions.
 */
export class PullRequestNode extends Node {

  public readonly shouldNotPrint = !includePRLinks();

  /**
   * Constructs an instance of the class with the specified `pr` parameter.
   *
   * @param pr - A string representing the parameter to be assigned to the instance.
   */
  public constructor(public readonly pr: string) {
    super();
  }

  /**
   * Generates a formatted string representing a pull request or issue link
   * based on the method's logic and class properties.
   *
   * @returns A string with the formatted pull request link or null if printing is disabled.
   */
  public print(): string | null {
    const { pr, shouldUseGithubAutolink, repo, shouldNotPrint } = this;

    if (shouldNotPrint) return null;

    if (shouldUseGithubAutolink) return `#${ pr }`;

    return `[#${ pr }](${ repo.url }/issues/${ pr })`;
  }

}
