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

/* eslint-disable @typescript-eslint/no-magic-numbers */
import { getBooleanInput, getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import fetchMock from "fetch-mock";
import { generateFooter } from "../src/footer";
import { repository } from "../src/utils/index.js";

it("should return nothing", async () => {
  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const result = await generateFooter(info.previous.name);

  expect(result).toBe("");
});

it("should generate the changelog footer with new contributors", async () => {
  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const releaseNameInputName = "release-name";
  const releaseNameInputValue = "2.0.0";

  jest.mocked(getBooleanInput).mockImplementation((name) => {
    if (name === "mention-new-contributors") return true;

    return false;
  });

  jest.mocked(getInput).mockImplementation((name) => {
    switch (name) {
      case gitHubTokenInputName: return gitHubTokenInputValue;
      case releaseNameInputName: return releaseNameInputValue;
      default: return "";
    }
  });

  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const fetch = fetchMock.postOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/releases/generate-notes",
    {
      body: {
        body: "## New Contributors\n- Author Name",
      },
    },
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateFooter(info.previous.name);

  expect(result).toEqual("\n\n## New Contributors\n- Author Name\n");

  expect(getInput).toHaveBeenCalledTimes(2);

  expect(getInput).toHaveBeenNthCalledWith(1, releaseNameInputName, { required: true });
  expect(getInput).toHaveNthReturnedWith(1, releaseNameInputValue);

  expect(getInput).toHaveBeenNthCalledWith(2, gitHubTokenInputName, { required: true });
  expect(getInput).toHaveNthReturnedWith(2, gitHubTokenInputValue);

  expect(getOctokit).toHaveBeenCalledTimes(1);
  expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
});

it("should generate the changelog footer with the full changelog link", async () => {
  const { url } = repository();

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const releaseNameInputName = "release-name";
  const releaseNameInputValue = "2.0.0";

  jest.mocked(getBooleanInput).mockImplementation((name) => {
    if (name === "include-compare-link") return true;

    return false;
  });

  jest.mocked(getInput).mockImplementation((name) => {
    switch (name) {
      case gitHubTokenInputName: return gitHubTokenInputValue;
      case releaseNameInputName: return releaseNameInputValue;
      default: return "";
    }
  });

  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const result = await generateFooter(info.previous.name);

  expect(result).toEqual(`\n\n**Full Changelog**: [\`${ info.previous.name }...${ releaseNameInputValue }\`](${ url }/compare/${ info.previous.name }...${ releaseNameInputValue })`);

  expect(getInput).toHaveBeenCalledTimes(1);

  expect(getInput).toHaveBeenCalledWith(releaseNameInputName, { required: true });
  expect(getInput).toHaveReturnedWith(releaseNameInputValue);

  expect(getOctokit).toHaveBeenCalledTimes(0);
});

it("should generate the changelog footer with new contributors and the full changelog short link", async () => {
  const { url } = repository();

  const gitHubTokenInputName = "github-token";
  const gitHubTokenInputValue = "github-token-value";

  const releaseNameInputName = "release-name";
  const releaseNameInputValue = "2.0.0";

  jest.mocked(getBooleanInput).mockImplementation(() => true);

  jest.mocked(getInput).mockImplementation((name) => {
    switch (name) {
      case gitHubTokenInputName: return gitHubTokenInputValue;
      case releaseNameInputName: return releaseNameInputValue;
      default: return "";
    }
  });

  const info = {
    releaseId : "latest",
    prerelease: false,
    previous  : {
      name: "1.0.0",
      sha : "3c1177539c1a216084f922ea52e56dd719a25945",
    },
  };

  const fetch = fetchMock.postOnce(
    "begin:https://api.github.com/repos/ardalanamini/auto-changelog/releases/generate-notes",
    {
      body: {
        body: "## New Contributors\n- Author Name",
      },
    },
  );

  const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

  jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

  const result = await generateFooter(info.previous.name);

  expect(result).toEqual(`\n\n## New Contributors\n- Author Name\n\n\n**Full Changelog**: ${ url }/compare/${ info.previous.name }...${ releaseNameInputValue }`);

  expect(getInput).toHaveBeenCalledTimes(3);

  expect(getInput).toHaveBeenNthCalledWith(1, releaseNameInputName, { required: true });
  expect(getInput).toHaveNthReturnedWith(1, releaseNameInputValue);

  expect(getInput).toHaveBeenNthCalledWith(2, gitHubTokenInputName, { required: true });
  expect(getInput).toHaveNthReturnedWith(2, gitHubTokenInputValue);

  expect(getInput).toHaveBeenNthCalledWith(3, "release-name-prefix", { required: false });
  expect(getInput).toHaveNthReturnedWith(3, "");

  expect(getOctokit).toHaveBeenCalledTimes(1);
  expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
});
