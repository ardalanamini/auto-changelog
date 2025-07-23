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

import { setOutput } from "@actions/core";
import { context } from "@actions/github";
import { type TCommit, type TTag, APIBase } from "#apis";
import { includeCompareLink, mentionNewContributors, releaseName, useSemver } from "#inputs";

class TestAPI extends APIBase {

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public async getNewContributors(): Promise<string | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public async getPreviousTag(): Promise<TTag | null> {
    return null;
  }

  public async *iterateCommits(): AsyncGenerator<TCommit> {
    yield {
      sha   : this.currentSHA,
      commit: { message: "feat: add new feature" },
      author: { login: "ardalanamini" },
    };
  }

}

describe("getTagInfo", () => {
  it("should get tag information", async () => {
    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    const result = await testAPI.getTagInfo();

    expect(result).toEqual(info);
  });

  it("should get semver tag information", async () => {
    const info = {
      releaseId : "beta",
      prerelease: true,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    const releaseNameInputValue = `2.0.0-${ info.releaseId }.1`;

    jest.mocked(useSemver).mockReturnValueOnce(true);
    jest.mocked(releaseName).mockReturnValueOnce(releaseNameInputValue);

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    const result = await testAPI.getTagInfo();

    expect(result).toEqual(info);
  });
});

describe("generateChangelog", () => {
  it("should generate the changelog", async () => {
    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: info.previous.sha,
    };

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementation(async () => info.previous);

    jest.spyOn(testAPI, "iterateCommits").mockImplementation(async function *iterateCommits() {
      yield commit;
    });

    const result = await testAPI.generateChangelog(info.previous.sha);

    expect(result).toBe(`## CI\n* update test workflow (${ commit.sha } by @${ commit.author.login })\n`);
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

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: \n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementation(async () => info.previous);

    jest.spyOn(testAPI, "iterateCommits").mockImplementation(async function *iterateCommits() {
      yield commit;
    });

    const result = await testAPI.generateChangelog(info.previous.sha);

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

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow [ignore]\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: "3c1177539c1a216084f922ea52e56dd719a25945",
    };

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementation(async () => info.previous);

    jest.spyOn(testAPI, "iterateCommits").mockImplementation(async function *iterateCommits() {
      yield commit;
    });

    const result = await testAPI.generateChangelog(info.previous.sha);

    expect(result).toBe("");
  });
});

describe("generateFooter", () => {
  it("should return nothing", async () => {
    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    const result = await testAPI.generateFooter(info.previous.name);

    expect(result).toBe("");
  });

  it("should generate the changelog footer with new contributors", async () => {
    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    jest.mocked(releaseName).mockReturnValueOnce("2.0.0");
    jest.mocked(includeCompareLink).mockReturnValueOnce(false);

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getNewContributors")
      .mockImplementationOnce(async () => "## New Contributors\n- Author Name\n");
    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    const result = await testAPI.generateFooter(info.previous.name);

    expect(result).toBe("\n\n## New Contributors\n- Author Name\n");
  });

  it("should generate the changelog footer with the full changelog link", async () => {
    const releaseNameInputValue = "2.0.0";

    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    jest.mocked(releaseName).mockReturnValueOnce(releaseNameInputValue);
    jest.mocked(mentionNewContributors).mockReturnValueOnce(false);

    const testAPI = (new TestAPI);

    const result = await testAPI.generateFooter(info.previous.name);

    expect(result).toEqual(`\n\n**Full Changelog**: ${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }/compare/${ info.previous.name }...${ releaseNameInputValue }`);
  });

  it("should generate the changelog footer with new contributors and the full changelog", async () => {
    const releaseNameInputValue = "2.0.0";

    const info = {
      releaseId : "latest",
      prerelease: false,
      previous  : {
        name: "1.0.0",
        sha : "3c1177539c1a216084f922ea52e56dd719a25945",
      },
    };

    jest.mocked(releaseName).mockReturnValueOnce(releaseNameInputValue);

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getNewContributors")
      .mockImplementationOnce(async () => "## New Contributors\n- Author Name\n");
    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    const result = await testAPI.generateFooter(info.previous.name);

    expect(result).toEqual(`\n\n## New Contributors\n- Author Name\n\n\n**Full Changelog**: ${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }/compare/${ info.previous.name }...${ releaseNameInputValue }`);
  });
});

describe("generate", () => {
  it("should generate the outputs", async () => {
    const releaseNameInputValue = "2.0.0";

    const info = {
      releaseName: "2.0.0",
      releaseId  : "latest",
      prerelease : false,
      previous   : {
        name: "1.0.0",
        sha : "7a94b0db6150850cb1ae7243b13a4c972e9db261",
      },
    };

    const commit = {
      author: {
        login: "ardalanamini",
      },
      commit: {
        message: "ci: update test workflow\n\nSigned-off-by: Ardalan Amini <ardalanamini22@gmail.com>",
      },
      sha: info.previous.sha,
    };

    jest.mocked(releaseName).mockReturnValueOnce(releaseNameInputValue);

    const testAPI = (new TestAPI);

    jest.spyOn(testAPI, "getNewContributors")
      .mockImplementationOnce(async () => "## New Contributors\n- Ardalan Amini\n");

    jest.spyOn(testAPI, "getPreviousTag").mockImplementationOnce(async () => info.previous);

    jest.spyOn(testAPI, "iterateCommits").mockImplementation(async function *iterateCommits() {
      yield commit;
    });

    await testAPI.generate();

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    expect(setOutput).toHaveBeenCalledTimes(3);

    expect(setOutput).toHaveBeenCalledWith("prerelease", info.prerelease);

    expect(setOutput).toHaveBeenCalledWith("release-id", info.releaseId);

    expect(setOutput).toHaveBeenCalledWith(
      "changelog",
      `## CI\n* update test workflow (${ commit.sha } by @${ commit.author.login })\n\n\n## New Contributors\n- Ardalan Amini\n\n\n**Full Changelog**: ${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }/compare/${ info.previous.name }...${ releaseNameInputValue }`,
    );
  });
});
