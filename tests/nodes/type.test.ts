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

import { context } from "@actions/github";
import { CommitNode, Node, ScopeNode, TypeNode } from "#nodes";

it("should not print anything when no scopes/commits are added", () => {
  const commitType = "commit-type";

  const typeNode = new TypeNode(commitType);

  expect(typeNode).toBeInstanceOf(Node);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);
  expect(typeNode.repo).toEqual({
    ...context.repo,
    url: `${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }`,
  });

  expect(typeNode.print()).toBeNull();
});

it("should not print anything when no commits are added", () => {
  const commitType = "commit-type";

  const scope = "commit-scope";

  const typeNode = new TypeNode(commitType);

  const scopeNode = typeNode.addScope(scope);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);

  expect(scopeNode).toBeInstanceOf(ScopeNode);

  expect(typeNode.print()).toBeNull();
});

it("should print a type & its scope/commit", () => {
  const commitType = "commit-type";

  const scope = "commit-scope";

  const description = "ci: update test workflow";

  const typeNode = new TypeNode(commitType);

  const scopeNode = typeNode.addScope(scope);

  const commitNode = scopeNode.addCommit(description);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);

  expect(scopeNode).toBeInstanceOf(ScopeNode);

  expect(commitNode).toBeInstanceOf(CommitNode);

  expect(typeNode.print()).toBe(`## ${ commitType }\n${ scopeNode.print() }`);
});

it("should reuse the same scope (in the case the breaking matches as well)", () => {
  const commitType = "commit-type";

  const scope = "commit-scope";

  const description = "ci: update test workflow";
  const description2 = "chore: update copyright year";

  const typeNode = new TypeNode(commitType);

  const scopeNode = typeNode.addScope(scope);
  const scopeNode2 = typeNode.addScope(scope);

  const commitNode = scopeNode.addCommit(description);
  const commitNode2 = scopeNode2.addCommit(description2);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);

  expect(scopeNode).toBeInstanceOf(ScopeNode);
  expect(scopeNode2).toBeInstanceOf(ScopeNode);

  expect(scopeNode).toBe(scopeNode2);

  expect(commitNode).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  const result = typeNode.print();

  expect(result).toBe(`## ${ commitType }\n${ scopeNode.print() }`);
  expect(result).toBe(`## ${ commitType }\n${ scopeNode2.print() }`);
});

it("should print a type & its scope/commit with prefix", () => {
  const commitType = "commit-type";

  const scope = "commit-scope";

  const description = "ci: update test workflow";

  const typeNode = new TypeNode(commitType);

  const scopeNode = typeNode.addScope(scope);

  const commitNode = scopeNode.addCommit(description);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);

  expect(scopeNode).toBeInstanceOf(ScopeNode);

  expect(commitNode).toBeInstanceOf(CommitNode);

  const prefix = "  ";

  expect(typeNode.print(prefix)).toBe(`${ prefix }## ${ commitType }\n${ scopeNode.print(prefix) }`);
});

it("should print a type & its multiple scope/commits", () => {
  const commitType = "commit-type";

  const scope = "commit-scope";

  const description = "ci: update test workflow";
  const description2 = "chore: update copyright year";

  const typeNode = new TypeNode(commitType);

  const scopeNode = typeNode.addScope(scope);
  const commitNode = scopeNode.addCommit(description);

  const scopeNode2 = typeNode.addScope();
  const commitNode2 = scopeNode2.addCommit(description2);

  expect(typeNode.type).toBe(commitType);

  expect(typeNode.shouldUseGithubAutolink).toBe(true);

  expect(scopeNode).toBeInstanceOf(ScopeNode);
  expect(scopeNode2).toBeInstanceOf(ScopeNode);

  expect(commitNode).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(typeNode.print()).toBe(`## ${ commitType }\n${ scopeNode2.print() }\n${ scopeNode.print() }`);
});
