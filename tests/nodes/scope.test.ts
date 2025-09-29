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
import { CommitNode, Node, ScopeNode } from "#nodes";

it("should not print anything", () => {
  const scope = "commit-scope";

  const scopeNode = new ScopeNode(scope);

  expect(scopeNode).toBeInstanceOf(Node);

  expect(scopeNode.scope).toBe(scope);

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);
  expect(scopeNode.repo).toEqual({
    ...context.repo,
    url: `${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }`,
  });

  expect(scopeNode.print()).toBeNull();
});

it("should print a scope & its commit", () => {
  const scope = "commit-scope";

  const description = "ci: update test workflow";

  const scopeNode = new ScopeNode(scope);

  const commitNode = scopeNode.addCommit(description);

  expect(scopeNode.scope).toBe(scope);

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);

  expect(scopeNode.print()).toBe(`* **${ scope }:**\n${ commitNode.print("  ") }`);
});

it("should reuse the same commit message (in the case the breaking matches as well)", () => {
  const scope = "commit-scope";

  const description = "ci: update test workflow";

  const scopeNode = new ScopeNode(scope);

  const commitNode = scopeNode.addCommit(description);
  const commitNode2 = scopeNode.addCommit(description);

  expect(scopeNode.scope).toBe(scope);

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(commitNode).toBe(commitNode2);

  const result = scopeNode.print();

  expect(result).toBe(`* **${ scope }:**\n${ commitNode.print("  ") }`);
  expect(result).toBe(`* **${ scope }:**\n${ commitNode2.print("  ") }`);
});

it("should print a scope & its commit with prefix", () => {
  const scope = "commit-scope";

  const description = "ci: update test workflow";

  const scopeNode = new ScopeNode(scope);

  const commitNode = scopeNode.addCommit(description);

  expect(scopeNode.scope).toBe(scope);

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);

  const prefix = "  ";

  expect(scopeNode.print(prefix)).toBe(`${ prefix }* **${ scope }:**\n${ commitNode.print(`${ prefix }  `) }`);
});

it("should print a scope & its multiple commits", () => {
  const scope = "commit-scope";

  const description = "ci: update test workflow";
  const description2 = "chore: update copyright year";

  const scopeNode = new ScopeNode(scope);

  const commitNode = scopeNode.addCommit(description);
  const commitNode2 = scopeNode.addCommit(description2);

  expect(scopeNode.scope).toBe(scope);

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(scopeNode.print()).toBe(`* **${ scope }:**\n${ commitNode.print("  ") }\n${ commitNode2.print("  ") }`);
});

it("should print a commit without scope", () => {
  const description = "ci: update test workflow";

  const scopeNode = (new ScopeNode);

  const commitNode = scopeNode.addCommit(description);

  expect(scopeNode.scope).toBe("");

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);

  expect(scopeNode.print()).toBe(commitNode.print());
});

it("should print multiple commits without scope", () => {
  const description = "ci: update test workflow";
  const description2 = "chore: update copyright year";

  const scopeNode = (new ScopeNode);

  const commitNode = scopeNode.addCommit(description);
  const commitNode2 = scopeNode.addCommit(description2);

  expect(scopeNode.scope).toBe("");

  expect(scopeNode.shouldUseGithubAutolink).toBe(true);

  expect(commitNode).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(scopeNode.print()).toBe(`${ commitNode.print() }\n${ commitNode2.print() }`);
});
