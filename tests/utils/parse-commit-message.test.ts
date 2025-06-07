/**
 * MIT License
 *
 * Copyright (c) 2024-2025 Ardalan Amini
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

/* eslint-disable no-undefined */
import { parseCommitMessage } from "../../src/utils";

describe("acceptable commit message formats", () => {
  it("should parse the commit message with breaking false", () => {
    expect(parseCommitMessage("type(scope): the description [flag]")).toEqual({
      breaking   : false,
      description: "the description",
      flag       : "flag",
      pr         : undefined,
      scope      : "scope",
      type       : "type",
    });
  });

  it("should parse the commit message with breaking true", () => {
    expect(parseCommitMessage("type(scope)!: the description [flag]")).toEqual({
      breaking   : true,
      description: "the description",
      flag       : "flag",
      pr         : undefined,
      scope      : "scope",
      type       : "type",
    });
  });

  it("should parse the commit message with PR number", () => {
    expect(parseCommitMessage("type(scope): the description (#1) [flag]")).toEqual({
      breaking   : false,
      description: "the description",
      flag       : "flag",
      pr         : "1",
      scope      : "scope",
      type       : "type",
    });
  });

  it("should parse the commit message with without flag", () => {
    expect(parseCommitMessage("type(scope): the description")).toEqual({
      breaking   : false,
      description: "the description",
      flag       : undefined,
      pr         : undefined,
      scope      : "scope",
      type       : "type",
    });
  });

  it("should parse the commit message with without scope", () => {
    expect(parseCommitMessage("type: the description")).toEqual({
      breaking   : false,
      description: "the description",
      flag       : undefined,
      pr         : undefined,
      scope      : undefined,
      type       : "type",
    });
  });
});

describe("unacceptable (ignored) commit message formats", () => {
  it.each(["1.0.0", "1.0.0-alpha.1"])("should not parse the npm versioning commit message: \"%s\"", (message) => {
    expect(parseCommitMessage(message)).toEqual({
      breaking   : false,
      description: undefined,
      flag       : undefined,
      pr         : undefined,
      scope      : undefined,
      type       : undefined,
    });
  });

  it.each([
    "Merge branch 'development'",
    "Merge branch 'development' into main",
    "Merge pull request #1 from auto-changelog/main",
    "Merge branch 'main' of github.com:auto-changelog/main",
    "Merge branch 'main' of https://github.com/auto-changelog/main",
  ])("should not parse the merge commit message: \"%s\"", (message) => {
    expect(parseCommitMessage(message)).toEqual({
      breaking   : false,
      description: undefined,
      flag       : undefined,
      pr         : undefined,
      scope      : undefined,
      type       : undefined,
    });
  });
});
