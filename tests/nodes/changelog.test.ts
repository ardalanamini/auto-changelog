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
import { commitTypes, defaultCommitType, useGitHubAutolink } from "#inputs";
import { ChangelogNode, CommitNode, ScopeNode, TypeNode } from "#nodes";

it("should create an instance with common values", () => {
  const changelogNode = (new ChangelogNode);

  expect(changelogNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());
  expect(changelogNode.defaultType).toBe(defaultCommitType());
  expect(changelogNode.typeMap).toEqual(commitTypes());
  expect(changelogNode.repo).toEqual({
    ...context.repo,
    url: `${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }`,
  });

  expect(changelogNode.print()).toBeNull();
});

it("should not print anything", () => {
  const changelogNode = (new ChangelogNode);

  const typeNode = changelogNode.addType("feat");

  const scopeNode = typeNode.addScope();

  expect(typeNode).toBeInstanceOf(TypeNode);
  expect(scopeNode).toBeInstanceOf(ScopeNode);

  expect(changelogNode.print()).toBeNull();
});

it("should print commit changelog", () => {
  const changelogNode = (new ChangelogNode);

  const commitNode1 = changelogNode.addType("feat").addScope()
    .addCommit("implement awesome feature");
  const commitNode2 = changelogNode.addType("fix").addScope()
    .addCommit("fix some issue");

  expect(commitNode1).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(changelogNode.print()).toBe("## New Features\n* implement awesome feature\n\n## Bug Fixes\n* fix some issue");
});
