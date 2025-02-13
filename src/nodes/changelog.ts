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

import { commitTypes, defaultCommitType } from "../inputs/index.js";
import { Node } from "./node.js";
import { TypeNode } from "./type.js";

export class ChangelogNode extends Node {

  public readonly defaultType = defaultCommitType();

  public readonly typeMap = commitTypes();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly acceptedTypes = [...new Set(Object.values(this.typeMap).concat(this.defaultType))];

  protected readonly types = (new Map<string, TypeNode>);

  public addType(type?: string): TypeNode {
    const { types, acceptedTypes, defaultType } = this;

    if (!type || !acceptedTypes.includes(type)) type = defaultType;

    if (types.has(type)) return types.get(type)!;

    const typeNode = new TypeNode(type);

    types.set(type, typeNode);

    return typeNode;
  }

  public print(prefix = ""): string | null {
    const { types, acceptedTypes } = this;

    if (types.size === 0) return null;

    const parts: string[] = [];

    for (const key of acceptedTypes) {
      const type = types.get(key);

      if (!type) continue;

      const printedType = type.print(prefix);

      if (printedType) parts.push(printedType);
    }

    if (parts.length === 0) return null;

    return parts.join("\n\n");
  }

}
