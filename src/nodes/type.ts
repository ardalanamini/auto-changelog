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
import { ScopeNode } from "./scope.js";
import { trim } from "../utils/index.js";

/**
 * Represents a node for a specific type that manages associated scopes.
 * Provides methods to add scopes and retrieve a formatted string representation
 * of its contents, including associated scopes and their respective commits.
 */
export class TypeNode extends Node {

  protected readonly scopes = (new Map<string, ScopeNode>);

  /**
   * Constructs an instance of type node class with a specified type.
   *
   * @param type - The commit type associated with the instance.
   */
  public constructor(public readonly type: string) {
    super();
  }

  /**
   * Adds a new scope to the scope collection.
   * If the scope already exists,
   * the existing scope node is returned instead of creating a new one.
   *
   * @param [scope=""] - The name of the scope to be added.
   * @returns The scope node associated with the added or existing scope.
   */
  public addScope(scope = ""): ScopeNode {
    const { scopes } = this;

    scope = trim(scope);

    // Reusing the already added scope to group the commits.
    if (scopes.has(scope)) return scopes.get(scope)!;

    const scopeNode = new ScopeNode(scope);

    scopes.set(scope, scopeNode);

    return scopeNode;
  }

  /**
   * Prints the commits and their scopes grouped in this type.
   *
   * @param [prefix=""] - A prefix string to prepend to the output.
   * @returns The formatted string representation, or null if no scopes are available.
   */
  public print(prefix = ""): string | null {
    const { type, scopes } = this;

    if (scopes.size === 0) return null;

    const parts: string[] = [`${ prefix }## ${ type }`];

    /**
     * Sorting the scopes to have a consistent output order in all changelogs.
     */
    const scopeKeys = [...scopes.keys()].sort((a, b) => a.localeCompare(b));

    for (const key of scopeKeys) {
      const scope = scopes.get(key)!;

      const printedScope = scope.print(prefix);

      if (printedScope) parts.push(printedScope);
    }

    // If only the header exists with no scope content, return null
    if (parts.length === 1) return null;

    return parts.join("\n");
  }

}
