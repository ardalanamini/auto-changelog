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
import { CommitAuthorNode, CommitHashNode, Node, PullRequestNode } from "../../src/nodes";

const repo = {
  owner: "ardalanamini",
  repo : "auto-changelog",
};
const url = `${ context.serverUrl }/${ repo.owner }/${ repo.repo }`;

beforeEach(() => {
  jest.spyOn(context, "repo", "get").mockReturnValueOnce(repo);
});

it("should print the username only to be autolinked", () => {
  jest.mocked(getBooleanInput).mockReturnValue(true);

  const username = "ardalanamini";

  const commitAuthorNode = new CommitAuthorNode(username);

  expect(commitAuthorNode).toBeInstanceOf(Node);

  expect(commitAuthorNode.username).toBe(username);

  expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
  expect(commitAuthorNode.shouldUseGithubAutolink).toBe(true);
  expect(commitAuthorNode.repo).toEqual({
    ...repo,
    url,
  });

  expect(commitAuthorNode.print()).toBe(`@${ username }`);
});

it("should not print anything", () => {
  jest.mocked(getBooleanInput).mockImplementation(name => name !== "mention-authors");

  const username = "ardalanamini";

  const commitAuthorNode = new CommitAuthorNode(username);

  expect(commitAuthorNode.username).toBe(username);

  expect(commitAuthorNode.shouldMentionAuthor).toBe(false);
  expect(commitAuthorNode.shouldUseGithubAutolink).toBe(true);

  expect(commitAuthorNode.print()).toBeNull();
});

it("should print the username with the link (not using autolink)", () => {
  jest.mocked(getBooleanInput).mockImplementation(name => name !== "use-github-autolink");

  const username = "ardalanamini";

  const commitAuthorNode = new CommitAuthorNode(username);

  expect(commitAuthorNode.username).toBe(username);

  expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
  expect(commitAuthorNode.shouldUseGithubAutolink).toBe(false);

  expect(commitAuthorNode.print()).toBe(`[@${ username }](${ url }/${ username })`);
});

describe("should print the username & commit sha", () => {
  it("with autolink", () => {
    jest.mocked(getBooleanInput).mockReturnValue(true);

    const username = "ardalanamini";
    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(true);

    expect(reference).toBeInstanceOf(CommitHashNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } by @${ username }`);
  });

  it("without autolink", () => {
    jest.mocked(getBooleanInput).mockImplementation(name => name !== "use-github-autolink");

    const username = "ardalanamini";
    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(false);

    expect(reference).toBeInstanceOf(CommitHashNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } by [@${ username }](${ url }/${ username })`);
  });
});

describe("should print the username & pr (prioritized over commit sha)", () => {
  it("with autolink", () => {
    jest.mocked(getBooleanInput).mockReturnValue(true);

    const username = "ardalanamini";
    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";
    const pr = "197";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha, pr);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(true);

    expect(reference).toBeInstanceOf(PullRequestNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } by @${ username }`);
  });

  it("without autolink", () => {
    jest.mocked(getBooleanInput).mockImplementation(name => name !== "use-github-autolink");

    const username = "ardalanamini";
    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";
    const pr = "197";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha, pr);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(false);

    expect(reference).toBeInstanceOf(PullRequestNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } by [@${ username }](${ url }/${ username })`);
  });
});

describe("should print the username & multiple references", () => {
  it("with autolink", () => {
    jest.mocked(getBooleanInput).mockReturnValue(true);

    const username = "ardalanamini";

    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";
    const pr = "197";

    const sha2 = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha, pr);
    const reference2 = commitAuthorNode.addReference(sha2);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(true);

    expect(reference).toBeInstanceOf(PullRequestNode);
    expect(reference2).toBeInstanceOf(CommitHashNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } & ${ reference2.print() } by @${ username }`);
  });

  it("without autolink", () => {
    jest.mocked(getBooleanInput).mockImplementation(name => name !== "use-github-autolink");

    const username = "ardalanamini";

    const sha = "3c1177539c1a216084f922ea52e56dd719a25945";
    const pr = "197";

    const sha2 = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const commitAuthorNode = new CommitAuthorNode(username);

    const reference = commitAuthorNode.addReference(sha, pr);
    const reference2 = commitAuthorNode.addReference(sha2);

    expect(commitAuthorNode.username).toBe(username);

    expect(commitAuthorNode.shouldMentionAuthor).toBe(true);
    expect(commitAuthorNode.shouldUseGithubAutolink).toBe(false);

    expect(reference).toBeInstanceOf(PullRequestNode);
    expect(reference2).toBeInstanceOf(CommitHashNode);

    expect(commitAuthorNode.print()).toBe(`${ reference.print() } & ${ reference2.print() } by [@${ username }](${ url }/${ username })`);
  });
});
