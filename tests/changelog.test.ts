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
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import fetchMock from "fetch-mock";
import { generateChangelog } from "../src/changelog.js";

it("should return nothing", async () => {
  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const shouldUseGithubAutolink = true;
  const defaultCommitType = "Other Changes";
  const commitTypes = "chore: Chores\nci: CI";

  jest.mocked(getBooleanInput).mockReturnValueOnce(shouldUseGithubAutolink);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case gitHubTokenInputName:
        return gitHubTokenInputValue;
      case "default-commit-type":
        return defaultCommitType;
      case "commit-types":
        return commitTypes;
      default:
        return "";
    }
  });

  const commit = {
    author: {
      login: "ardalanamini",
    },
    commit: {
      message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
    },
    sha: info.previous.sha,
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/commits",
    [commit],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateChangelog(info.previous.sha);

  expect(result).toBe("");
});

it("should return nothing (no description)", async () => {
  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "7a94b0db6150850cb1ae7243b13a4c972e9db261",
    },
  };

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const shouldUseGithubAutolink = true;
  const defaultCommitType = "Other Changes";
  const commitTypes = "chore: Chores\nci: CI";

  jest.mocked(getBooleanInput).mockReturnValueOnce(shouldUseGithubAutolink);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case gitHubTokenInputName:
        return gitHubTokenInputValue;
      case "default-commit-type":
        return defaultCommitType;
      case "commit-types":
        return commitTypes;
      default:
        return "";
    }
  });

  const commit = {
    author: {
      login: "ardalanamini",
    },
    commit: {
      message: "ci: \n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
    },
    sha: "3c1177539c1a216084f922ea52e56dd719a25945",
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/commits",
    [
      commit, {
        author: {
          login: "ardalanamini",
        },
        commit: {
          message: "chore: update copyright year\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
        },
        sha: info.previous.sha,
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateChangelog(info.previous.sha);

  expect(result).toBe("");
});

it("should return nothing (flagged to ignore)", async () => {
  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "7a94b0db6150850cb1ae7243b13a4c972e9db261",
    },
  };

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const shouldUseGithubAutolink = true;
  const defaultCommitType = "Other Changes";
  const commitTypes = "chore: Chores\nci: CI";

  jest.mocked(getBooleanInput).mockReturnValueOnce(shouldUseGithubAutolink);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case gitHubTokenInputName:
        return gitHubTokenInputValue;
      case "default-commit-type":
        return defaultCommitType;
      case "commit-types":
        return commitTypes;
      default:
        return "";
    }
  });

  const commit = {
    author: {
      login: "ardalanamini",
    },
    commit: {
      message: "ci: update test workflow [ignore]\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
    },
    sha: "3c1177539c1a216084f922ea52e56dd719a25945",
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/commits",
    [
      commit, {
        author: {
          login: "ardalanamini",
        },
        commit: {
          message: "chore: update copyright year\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
        },
        sha: info.previous.sha,
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateChangelog(info.previous.sha);

  expect(result).toBe("");
});

it("should generate the changelog", async () => {
  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "7a94b0db6150850cb1ae7243b13a4c972e9db261",
    },
  };

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const shouldUseGithubAutolink = true;
  const defaultCommitType = "Other Changes";
  const commitTypes = "chore: Chores\nci: CI";

  jest.mocked(getBooleanInput).mockReturnValueOnce(shouldUseGithubAutolink);
  jest.mocked(getInput).mockImplementation((input) => {
    switch (input) {
      case gitHubTokenInputName:
        return gitHubTokenInputValue;
      case "default-commit-type":
        return defaultCommitType;
      case "commit-types":
        return commitTypes;
      default:
        return "";
    }
  });

  const commit = {
    author: {
      login: "ardalanamini",
    },
    commit: {
      message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
    },
    sha: "3c1177539c1a216084f922ea52e56dd719a25945",
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/commits",
    [
      commit, {
        author: {
          login: "ardalanamini",
        },
        commit: {
          message: "chore: update copyright year\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
        },
        sha: info.previous.sha,
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateChangelog(info.previous.sha);

  expect(result).toBe("## CI\n* update test workflow\n");
});
