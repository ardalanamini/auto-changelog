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
import { getTagInfo } from "../src/tag";

it("should get tag information", async () => {
  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  jest.mocked(getInput).mockImplementationOnce((name) => {
    if (name === gitHubTokenInputName) return gitHubTokenInputValue;

    return "";
  });

  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/tags",
    [
      {
        name  : info.previous.name,
        commit: {
          sha: info.previous.sha,
        },
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await getTagInfo();

  expect(result).toEqual(info);

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(gitHubTokenInputName, { required: true });

  expect(getOctokit).toHaveBeenCalledTimes(1);
  expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
});

it("should get semver tag information", async () => {
  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const releaseNameInputName = "release-name";
  const releaseNameInputValue = "2.0.0-beta.1";

  const releaseNamePrefixInputName = "release-name-prefix";
  const releaseNamePrefixInputValue = "";

  jest.mocked(getBooleanInput).mockReturnValueOnce(true);
  jest.mocked(getInput).mockImplementation((name) => {
    switch (name) {
      case gitHubTokenInputName: return gitHubTokenInputValue;
      case releaseNameInputName: return releaseNameInputValue;
      case releaseNamePrefixInputName: return releaseNamePrefixInputValue;
      default: return "";
    }
  });

  const info = {
    releaseId : "beta",
    prerelease: true,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const fetch = fetchMock.getOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/tags",
    [
      {
        name  : info.previous.name,
        commit: {
          sha: info.previous.sha,
        },
      },
    ],
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await getTagInfo();

  expect(result).toEqual(info);

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  expect(getInput).toHaveBeenCalledTimes(3);
  expect(getInput).toHaveBeenCalledWith(gitHubTokenInputName, { required: true });
  expect(getInput).toHaveBeenCalledWith(releaseNameInputName, { required: true });
  expect(getInput).toHaveBeenCalledWith(releaseNamePrefixInputName, { required: false });

  expect(getOctokit).toHaveBeenCalledTimes(1);
  expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
});
