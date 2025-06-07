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
import { TypeNode } from "./type.js";
import { commitTypes, defaultCommitType } from "../inputs/index.js";
import { trim } from "../utils/index.js";

/**
 * Represents a changelog node which organizes and processes commit types into structured changelog entries.
 * This class manages the mapping of commit types to their human-readable counterparts, aggregates commit
 * types into groups, and generates a formatted output.
 */
export class ChangelogNode extends Node {

  public readonly defaultType = defaultCommitType();

  public readonly typeMap = commitTypes();

  protected readonly types = (new Map<string, TypeNode>);

  /**
   * Adds a new type or retrieves an existing one from the already added types.
   * If the input `type` is not found in the type map, the default type is assigned.
   *
   * @param [type=""] - The commit type to be mapped and added.
   * @returns The corresponding type node that represents the added or existing type.
   */
  public addType(type = ""): TypeNode {
    const { types, typeMap, defaultType } = this;

    // Map the commit type to the human-readable changelog type.
    type = typeMap[trim(type)] ?? defaultType;

    // Reusing the already added type to group the commits.
    if (types.has(type)) return types.get(type)!;

    const typeNode = new TypeNode(type);

    types.set(type, typeNode);

    return typeNode;
  }

  /**
   * Compiles and concatenates the output of all accepted types into a single string, prefixed by the provided prefix.
   *
   * @param [prefix=""] - A string that is prefixed to each type's printed output.
   * @returns A concatenated string of all printed types with the applied prefix, or null if no types are available.
   */
  public print(prefix = ""): string | null {
    const { types, typeMap, defaultType } = this;

    if (types.size === 0) return null;

    /**
     * Using this instead of iterating over the `types` values allows the action users to apply their own custom order.
     */
    const acceptedTypes = [...new Set([...Object.values(typeMap), ...defaultType])];

    const parts: string[] = [];

    for (const key of acceptedTypes) {
      const type = types.get(key);

      if (!type) continue;

      const printedType = type.print(prefix);

      if (printedType) parts.push(printedType);
    }

    if (parts.length === 0) return null;

    // Joined by 2 new lines to have one empty line between each type group.
    return parts.join("\n\n");
  }

}
