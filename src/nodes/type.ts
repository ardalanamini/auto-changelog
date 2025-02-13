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

import { Node } from "./node.js";
import { ScopeNode } from "./scope.js";

export class TypeNode extends Node {

  protected readonly scopes = (new Map<string, ScopeNode>);

  public constructor(public readonly type: string) {
    super();
  }

  public addScope(scope = ""): ScopeNode {
    const { scopes } = this;

    if (scopes.has(scope)) return scopes.get(scope)!;

    const commit = new ScopeNode(scope);

    scopes.set(scope, commit);

    return commit;
  }

  public print(prefix = ""): string | null {
    const { type, scopes } = this;

    if (scopes.size === 0) return null;

    const parts: string[] = [`${ prefix }## ${ type }`];

    for (const scope of scopes.values()) {
      const printedScope = scope.print(prefix);

      if (printedScope) parts.push(printedScope);
    }

    if (parts.length === 0) return null;

    return parts.join("\n");
  }

}
