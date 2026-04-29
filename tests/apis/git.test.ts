/**
 * MIT License
 *
 * Copyright (c) 2026 Ardalan Amini
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

import { spawn as nodeSpawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { getInput } from "@actions/core";
import { GitAPI } from "#apis";
import { releaseName, useSemver } from "#inputs";
import { cache } from "#utils";

jest.mock("node:child_process", () => ({
  spawn: jest.fn(),
}));

const FIELD_SEPARATOR = "\u001F";
const RECORD_SEPARATOR = "\u001E";

class MockChildProcess extends EventEmitter {

  public stderr: AsyncIterable<Buffer>;

  public stdout: AsyncIterable<Buffer>;

  private closed = false;

  private readonly exitCode: number;

  public constructor(options: {
    /* eslint-disable-next-line @stylistic/key-spacing -- optional property */
    exitCode?: number;
    stderrChunks?: string[];
    stdoutChunks?: string[];
  }) {
    super();
    this.exitCode = options.exitCode ?? 0;
    this.stderr = this.makeIterable((options.stderrChunks ?? []).map(s => Buffer.from(s, "utf8")));
    this.stdout = this.makeIterable((options.stdoutChunks ?? []).map(s => Buffer.from(s, "utf8")), true);
  }

  public kill(): void {
    this.finish();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override once(eventName: any, listener: any): this {
    if (eventName === "close" && this.closed) {
      listener(this.exitCode);
      return this;
    }
    return super.once(eventName, listener);
  }

  private finish(): void {
    if (this.closed) return;
    this.closed = true;
    this.emit("close", this.exitCode);
  }

  private async *makeIterable(buffers: Buffer[], finishOnEnd = false): AsyncGenerator<Buffer> {
    for (const b of buffers) yield b;
    if (finishOnEnd) this.finish();
  }

}

function setSpawnImplementation(impl: (gitArguments: string[]) => MockChildProcess): void {
  const spawnMock = jest.mocked(nodeSpawn);
  spawnMock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    .mockImplementation(((command: string, spawnArguments: string[]) => impl([command, ...spawnArguments])) as never);
}

describe("GitAPI", () => {
  beforeEach(() => {
    jest.mocked(useSemver).mockReturnValue(false);
    jest.mocked(releaseName).mockReturnValue("2.0.0");
    jest.mocked(getInput).mockImplementation((name: string) => (name === "github-token" ? "" : ""));
  });

  it("streams commits and stops at fromSHA", async () => {
    setSpawnImplementation((gitArguments) => {
      if (gitArguments[1] === "--no-pager" && gitArguments[2] === "log") {
        expect(gitArguments[4]).toContain("%B");

        const commit1 = `aaa${ FIELD_SEPARATOR }Jane Doe${ FIELD_SEPARATOR }jane@example.com${ FIELD_SEPARATOR }feat: one\n\nbody line${ RECORD_SEPARATOR }`;
        const commit2 = `bbb${ FIELD_SEPARATOR }John Doe${ FIELD_SEPARATOR }john@example.com${ FIELD_SEPARATOR }fix: two${ RECORD_SEPARATOR }`;

        // Split across chunks to ensure incremental parsing works
        return new MockChildProcess({ stdoutChunks: [commit1.slice(0, 10), commit1.slice(10) + commit2] });
      }

      throw new Error(`Unexpected git args: ${ gitArguments.join(" ") }`);
    });

    const api = new GitAPI();

    const commits = [];
    for await (const c of api.iterateCommits("bbb")) commits.push(c);

    expect(commits).toEqual([
      {
        sha   : "aaa",
        commit: { message: "feat: one\n\nbody line" },
        author: { login: "jane" },
      },
    ]);
  });

  it("selects previous tag using streaming for-each-ref and rev-list", async () => {
    jest.mocked(useSemver).mockReturnValueOnce(true);
    jest.mocked(releaseName).mockReturnValueOnce("2.0.0");

    setSpawnImplementation((gitArguments) => {
      if (gitArguments[1] === "--no-pager" && gitArguments[2] === "for-each-ref") {
        const tags
          = `3.0.0${ FIELD_SEPARATOR }deadbeef${ RECORD_SEPARATOR }`
            + `1.5.0${ FIELD_SEPARATOR }deadbeef${ RECORD_SEPARATOR }`
            + `1.9.0${ FIELD_SEPARATOR }deadbeef${ RECORD_SEPARATOR }`;
        return new MockChildProcess({ stdoutChunks: [tags] });
      }

      if (gitArguments[1] === "rev-list") {
        const tagName = gitArguments.at(-1);
        expect(tagName).toBe("1.9.0");
        return new MockChildProcess({ stdoutChunks: ["abc123\n"] });
      }

      // iterateCommits in constructor isn't called; any other invocations are unexpected here
      throw new Error(`Unexpected git args: ${ gitArguments.join(" ") }`);
    });

    const api = new GitAPI();
    const previous = await api.getPreviousTag();

    expect(previous).toEqual({
      name: "1.9.0",
      sha : "abc123",
    });
  });

  it("skips non-semver tags that resolve to the current SHA", async () => {
    cache("sha", () => "head-sha");

    const revListRequests: string[] = [];

    setSpawnImplementation((gitArguments) => {
      if (gitArguments[1] === "--no-pager" && gitArguments[2] === "for-each-ref") {
        const tags
          = `v2.0.0${ FIELD_SEPARATOR }tag-object-sha${ RECORD_SEPARATOR }`
            + `v1.0.0${ FIELD_SEPARATOR }tag-object-sha${ RECORD_SEPARATOR }`;
        return new MockChildProcess({ stdoutChunks: [tags] });
      }

      if (gitArguments[1] === "rev-list") {
        const tagName = gitArguments.at(-1);
        if (!tagName) throw new Error("Expected tag name.");

        revListRequests.push(tagName);

        if (tagName === "v2.0.0") return new MockChildProcess({ stdoutChunks: ["head-sha\n"] });
        if (tagName === "v1.0.0") return new MockChildProcess({ stdoutChunks: ["previous-sha\n"] });
      }

      throw new Error(`Unexpected git args: ${ gitArguments.join(" ") }`);
    });

    const api = new GitAPI();
    const previous = await api.getPreviousTag();

    expect(previous).toEqual({
      name: "v1.0.0",
      sha : "previous-sha",
    });
    expect(revListRequests).toEqual(["v2.0.0", "v1.0.0"]);
  });

  it("computes new contributors via shortlog without scanning all commits", async () => {
    jest.mocked(releaseName).mockReturnValueOnce("v2.0.0");

    setSpawnImplementation((gitArguments) => {
      if (gitArguments[1] === "--no-pager" && gitArguments[2] === "shortlog" && gitArguments[3] === "-sne") {
        const rev = gitArguments.at(-1);

        if (rev === "v1.0.0") {
          return new MockChildProcess({
            stdoutChunks: [
              "  10\tAlice <alice@example.com>\n",
              "   3\tBob <bob@example.com>\n",
            ],
          });
        }

        if (rev === "v1.0.0..v2.0.0") {
          return new MockChildProcess({
            stdoutChunks: [
              "   1\tBob <bob@example.com>\n",
              "   2\tCarol <carol@example.com>\n",
            ],
          });
        }
      }

      throw new Error(`Unexpected git args: ${ gitArguments.join(" ") }`);
    });

    const api = new GitAPI();

    const markdown = await api.getNewContributors("v1.0.0");
    expect(markdown).toBe("## New Contributors\n* Carol <carol@example.com>\n");
  });
});
