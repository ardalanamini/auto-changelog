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

import { getBooleanInput } from "@actions/core";
import { context } from "@actions/github";
import { Node, PullRequestNode } from "../../src/nodes";

const repo = {
  owner: "ardalanamini",
  repo : "auto-changelog",
};

beforeEach(() => {
  jest.spyOn(context, "repo", "get").mockReturnValueOnce(repo);
});

it("should print the pr only to be autolinked", () => {
  jest.mocked(getBooleanInput).mockReturnValue(true);

  const pr = "197";

  const pullRequestNode = new PullRequestNode(pr);

  expect(pullRequestNode).toBeInstanceOf(Node);

  expect(pullRequestNode.pr).toBe(pr);

  expect(pullRequestNode.shouldNotPrint).toBe(false);
  expect(pullRequestNode.shouldUseGithubAutolink).toBe(true);
  expect(pullRequestNode.repo).toEqual({
    ...repo,
    url: `${ context.serverUrl }/${ repo.owner }/${ repo.repo }`,
  });

  expect(pullRequestNode.print()).toBe(`#${ pr }`);
});

it("should not print anything", () => {
  jest.mocked(getBooleanInput).mockReturnValue(false);

  const pr = "197";

  const pullRequestNode = new PullRequestNode(pr);

  expect(pullRequestNode.pr).toBe(pr);

  expect(pullRequestNode.shouldNotPrint).toBe(true);
  expect(pullRequestNode.shouldUseGithubAutolink).toBe(false);

  expect(pullRequestNode.print()).toBeNull();
});

it("should print the pr with the link (not using autolink)", () => {
  jest.mocked(getBooleanInput).mockImplementation(name => name !== "use-github-autolink");

  const pr = "197";

  const pullRequestNode = new PullRequestNode(pr);

  expect(pullRequestNode.pr).toBe(pr);

  expect(pullRequestNode.shouldNotPrint).toBe(false);
  expect(pullRequestNode.shouldUseGithubAutolink).toBe(false);

  expect(pullRequestNode.print()).toBe(`[#${ pr }](${ context.serverUrl }/${ repo.owner }/${ repo.repo }/issues/${ pr })`);
});
