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

import { getBooleanInput, getInput } from "@actions/core";
import { context } from "@actions/github";
import YAML from "yaml";
import { ChangelogNode, CommitNode, ScopeNode, TypeNode } from "#nodes";

const repo = {
  owner: "ardalanamini",
  repo : "auto-changelog",
};
const url = `${ context.serverUrl }/${ repo.owner }/${ repo.repo }`;

beforeEach(() => {
  jest.spyOn(context, "repo", "get").mockReturnValueOnce(repo);
});

it("should create an instance with common values", () => {
  const shouldUseGithubAutolink = true;
  const defaultCommitType = "Other Changes";
  const commitTypes = "feat: Features\nbug: Bug Fixes";

  jest.mocked(getBooleanInput).mockReturnValueOnce(shouldUseGithubAutolink);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case "default-commit-type":
        return defaultCommitType;
      case "commit-types":
        return commitTypes;
      default:
        return "";
    }
  });

  const changelogNode = (new ChangelogNode);

  expect(changelogNode.shouldUseGithubAutolink).toBe(shouldUseGithubAutolink);
  expect(changelogNode.defaultType).toBe(defaultCommitType);
  expect(changelogNode.typeMap).toEqual(YAML.parse(commitTypes));
  expect(changelogNode.repo).toEqual({
    ...repo,
    url,
  });

  expect(changelogNode.print()).toBeNull();
});

it("should not print anything", () => {
  jest.mocked(getBooleanInput).mockReturnValueOnce(true);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case "default-commit-type":
        return "Other Changes";
      case "commit-types":
        return "feat: Features\nbug: Bug Fixes";
      default:
        return "";
    }
  });

  const changelogNode = (new ChangelogNode);

  const typeNode = changelogNode.addType("feat");

  const scopeNode = typeNode.addScope();

  expect(typeNode).toBeInstanceOf(TypeNode);
  expect(scopeNode).toBeInstanceOf(ScopeNode);

  expect(changelogNode.print()).toBeNull();
});

it("should print commit changelog", () => {
  jest.mocked(getBooleanInput).mockReturnValueOnce(true);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case "default-commit-type":
        return "Other Changes";
      case "commit-types":
        return "feat: Features\nbug: Bug Fixes";
      default:
        return "";
    }
  });

  const changelogNode = (new ChangelogNode);

  const commitNode1 = changelogNode.addType("feat").addScope()
    .addCommit("implement awesome feature");
  const commitNode2 = changelogNode.addType("bug").addScope()
    .addCommit("fix some issue");

  expect(commitNode1).toBeInstanceOf(CommitNode);
  expect(commitNode2).toBeInstanceOf(CommitNode);

  expect(changelogNode.print()).toBe("## Features\n* implement awesome feature\n\n## Bug Fixes\n* fix some issue");
});
