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
import { useGitHubAutolink } from "#inputs";
import { CommitAuthorNode, CommitHashNode, CommitNode, Node } from "#nodes";

it("should print a commit description only", () => {
  const description = "ci: update test workflow";

  const commitNode = new CommitNode(description);

  expect(commitNode).toBeInstanceOf(Node);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(false);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());
  expect(commitNode.repo).toEqual({
    ...context.repo,
    url: `${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }`,
  });

  expect(commitNode.print()).toBe(`* ${ description }`);
});

it("should print a commit description with prefix", () => {
  const description = "ci: update test workflow";

  const commitNode = new CommitNode(description);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(false);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());

  const prefix = "  ";

  expect(commitNode.print(prefix)).toBe(`${ prefix }* ${ description }`);
});

it("should print a breaking commit description only", () => {
  const description = "ci: update test workflow";

  const commitNode = new CommitNode(description, true);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(true);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());

  expect(commitNode.print()).toBe(`* ***BREAKING:*** ${ description }`);
});

it("should print the commit description and its author", () => {
  const description = "ci: update test workflow";

  const username = "ardalanamini";

  const commitNode = new CommitNode(description);

  const author = commitNode.addAuthor(username);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(false);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());

  expect(author).toBeInstanceOf(CommitAuthorNode);

  expect(commitNode.print()).toBe(`* ${ description } (${ author.print() })`);
});

it("should print the commit description and its multiple authors", () => {
  const description = "ci: update test workflow";

  const username = "ardalanamini";
  const username2 = "not-ardalanamini";

  const commitNode = new CommitNode(description);

  const author = commitNode.addAuthor(username);
  const author2 = commitNode.addAuthor(username2);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(false);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());

  expect(author).toBeInstanceOf(CommitAuthorNode);
  expect(author2).toBeInstanceOf(CommitAuthorNode);

  expect(commitNode.print()).toBe(`* ${ description } (${ author.print() }, ${ author2.print() })`);
});

it("it should reuse the same author node for same authors", () => {
  const description = "ci: update test workflow";

  const username = "ardalanamini";

  const sha = "3c1177539c1a216084f922ea52e56dd719a25945";
  const sha2 = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

  const commitNode = new CommitNode(description);

  const author = commitNode.addAuthor(username);
  const reference = author.addReference(sha);

  const author2 = commitNode.addAuthor(username);
  const reference2 = author.addReference(sha2);

  expect(commitNode.description).toBe(description);
  expect(commitNode.breaking).toBe(false);

  expect(commitNode.shouldUseGithubAutolink).toBe(useGitHubAutolink());

  expect(author).toBeInstanceOf(CommitAuthorNode);
  expect(reference).toBeInstanceOf(CommitHashNode);

  expect(author2).toBeInstanceOf(CommitAuthorNode);
  expect(reference2).toBeInstanceOf(CommitHashNode);

  expect(author).toBe(author2);

  const result = commitNode.print();

  expect(result).toBe(`* ${ description } (${ author.print() })`);
  expect(result).toBe(`* ${ description } (${ author2.print() })`);
});
