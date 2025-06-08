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

import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import fetchMock from "fetch-mock";
import { iterateCommits } from "#utils";

it("should iterate over commits", async () => {
  const repo = {
    owner: "ardalanamini",
    repo : "auto-changelog",
  };

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  jest.mocked(getInput).mockImplementationOnce((name) => {
    if (name === gitHubTokenInputName) return gitHubTokenInputValue;

    return "";
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

  const fromSha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

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
        sha: fromSha,
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = iterateCommits(repo.owner, repo.repo, fromSha);

  expect(await result.next()).toEqual({
    done : false,
    value: commit,
  });
  expect(await result.next()).toEqual({
    done: true,
  });

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(gitHubTokenInputName, { required: true });

  expect(getOctokit).toHaveBeenCalledTimes(1);
  expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
});
