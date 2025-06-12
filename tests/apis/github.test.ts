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

import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import fetchMock from "fetch-mock";
import { GitHubAPI } from "#apis";
import { gitHubToken, releaseName, useSemver } from "#inputs";
import { cache } from "#utils";

describe("getNewContributors", () => {
  it("should return new contributors", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    cache("sha", () => commit.sha);

    const fromSha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const fetch = fetchMock.postOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/releases/generate-notes",
      {
        body: {
          body: "## New Contributors\n- Ardalan Amini",
        },
      },
    );

    const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

    jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getNewContributors(fromSha);

    expect(result).toBe("## New Contributors\n- Ardalan Amini\n");

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });

  it("should return null (when there's no new contributors)", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    cache("sha", () => commit.sha);

    const fromSha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const fetch = fetchMock.postOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/releases/generate-notes",
      {
        body: {
          body: "Some other text",
        },
      },
    );

    const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

    jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getNewContributors(fromSha);

    expect(result).toBeNull();

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });

  it("should return null (when the contributors is not a list)", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    cache("sha", () => commit.sha);

    const fromSha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const fetch = fetchMock.postOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/releases/generate-notes",
      {
        body: {
          body: "## New Contributors\n Ardalan Amini",
        },
      },
    );

    const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

    jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getNewContributors(fromSha);

    expect(result).toBeNull();

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });
});

describe("getPreviousTag", () => {
  it("should return the previous tag", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(releaseName).mockReturnValueOnce("2.0.0");
    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    const sha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    cache("sha", () => sha);

    const fetch = fetchMock.getOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/tags",
      [
        {
          name  : "1.1.0",
          commit: {
            sha,
          },
        },
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

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getPreviousTag();

    expect(result).toEqual(info.previous);

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });

  it("should return the previous semver tag", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(releaseName).mockReturnValueOnce("2.0.0");
    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);
    jest.mocked(useSemver).mockReturnValueOnce(true);

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
          name  : "3.0.0-alpha.1",
          commit: {
            sha: "7a94b0db6150850cb1ae7243b13a4c972e9db261",
          },
        },
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

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getPreviousTag();

    expect(result).toEqual(info.previous);

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });

  it("should return null", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const fetch = fetchMock.getOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/tags",
      [],
    );

    const gitHub = new GitHub({ request: { fetch: fetch.fetchHandler } });

    jest.mocked(getOctokit).mockImplementationOnce(() => gitHub);

    const githubAPI = (new GitHubAPI);

    const result = await githubAPI.getPreviousTag();

    expect(result).toBeNull();

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });
});

describe("iterateCommits", () => {
  it("should iterate over commits", async () => {
    const gitHubTokenInputValue = "github-token-value";

    jest.mocked(gitHubToken).mockReturnValueOnce(gitHubTokenInputValue);

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    cache("sha", () => commit.sha);

    const fromSha = "7a94b0db6150850cb1ae7243b13a4c972e9db261";

    const fetch = fetchMock.getOnce(
      "begin:https://api.github.com/repos/ardalanamini/auto-changelog/commits",
      [
        commit,
        {
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

    const githubAPI = (new GitHubAPI);

    const result = githubAPI.iterateCommits(fromSha);

    expect(await result.next()).toEqual({
      done : false,
      value: commit,
    });

    expect(await result.next()).toEqual({
      done: true,
    });

    expect(gitHubToken).toHaveBeenCalledTimes(1);

    expect(getOctokit).toHaveBeenCalledTimes(1);
    expect(getOctokit).toHaveBeenCalledWith(gitHubTokenInputValue);
  });
});
