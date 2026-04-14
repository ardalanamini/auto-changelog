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

import { spawn } from "node:child_process";
import { debug } from "@actions/core";
import { getOctokit } from "@actions/github";
import { gitHubToken } from "#inputs";
import { octokit, parseSemanticVersion } from "#utils";
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- defensive checks for split/API responses */
/* eslint-disable @stylistic/key-spacing -- conflicts with type-annotation-spacing in type definitions */
import { type TCommit, type TNewContributor, type TTag, APIBase } from "./api.js";

const RECORD_SEPARATOR = "\u001E";
const FIELD_SEPARATOR = "\u001F";

function formatGitCommand(args: string[]): string {
  return `git ${ args.join(" ") }`;
}

function spawnGit(args: string[]): ReturnType<typeof spawn> {
  debug(`[git] spawn -> ${ formatGitCommand(args) }`);
  return spawn("git", args, {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function readAllStdError(child: ReturnType<typeof spawn>): Promise<string> {
  const chunks: Buffer[] = [];
  if (!child.stderr) return "";
  for await (const chunk of child.stderr) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function waitForExit(child: ReturnType<typeof spawn>): Promise<number | null> {
  return new Promise((resolve) => {
    child.once("close", (code) => {
      resolve(code);
    });
  });
}

async function *streamRecords(args: string[]): AsyncGenerator<string> {
  const command = formatGitCommand(args);
  const child = spawnGit(args);

  let buffer = "";

  if (!child.stdout) throw new Error("Failed to read git stdout.");

  try {
    for await (const chunk of child.stdout) {
      buffer += chunk.toString("utf8");

      let index = buffer.indexOf(RECORD_SEPARATOR);

      while (index !== -1) {
        const record = buffer.slice(0, index);
        buffer = buffer.slice(index + RECORD_SEPARATOR.length);

        if (record) yield record;

        index = buffer.indexOf(RECORD_SEPARATOR);
      }
    }

    const exitCode = await waitForExit(child);

    if (exitCode !== 0) {
      const stderr = await readAllStdError(child);
      debug(`[git] failed -> ${ command } (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
      throw new Error(`git ${ args.join(" ") } failed (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
    }

    debug(`[git] done -> ${ command }`);
  } finally {
    child.kill();
  }
}

async function gitTrimmedStdout(args: string[]): Promise<string> {
  const command = formatGitCommand(args);
  const child = spawnGit(args);

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  if (!child.stdout || !child.stderr) throw new Error("Failed to read git output.");

  for await (const chunk of child.stdout) stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  for await (const chunk of child.stderr) stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));

  const exitCode = await waitForExit(child);

  const stdout = Buffer.concat(stdoutChunks).toString("utf8");
  const stderr = Buffer.concat(stderrChunks).toString("utf8");

  if (exitCode !== 0) {
    debug(`[git] failed -> ${ command } (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
    throw new Error(`git ${ args.join(" ") } failed (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
  }

  debug(`[git] done -> ${ command }`);

  return stdout.trim();
}

function parseShortlogLine(line: string): {
  email: string;
  name: string;
} | null {
  // Example: "  12\tJane Doe <jane@example.com>"
  const match = line.match(/^\s*\d+\s+(?<name>.+?)\s+<(?<email>[^>]+)>\s*$/);
  if (!match?.groups) return null;
  const { name, email } = match.groups;
  return {
    email: email.trim(),
    name: name.trim(),
  };
}

function getMaybeGitHubClient(): ReturnType<typeof getOctokit> | null {
  const token = gitHubToken(false);
  if (!token) return null;

  try {
    return octokit();
  } catch {
    return getOctokit(token);
  }
}

export class GitAPI extends APIBase {

  private readonly emailToLogin = new Map<string, string | null>();

  public async getNewContributors(previousTagName?: string): Promise<string | null> {
    debug(`[git-api] getNewContributors start (previousTagName=${ previousTagName ?? "none" })`);
    const contributors: string[] = [];

    for await (const c of this.listNewContributors(previousTagName)) {
      if ("username" in c) contributors.push(`* @${ c.username }`);
      else contributors.push(`* ${ c.name } <${ c.email }>`);
    }

    if (contributors.length === 0) {
      debug("[git-api] getNewContributors done (no contributors)");
      return null;
    }

    debug(`[git-api] getNewContributors done (contributors=${ contributors.length })`);
    return `## New Contributors\n${ contributors.join("\n") }\n`;
  }

  public async getPreviousTag(): Promise<TTag | null> {
    const { currentSHA, semanticVersion } = this;
    debug(`[git-api] getPreviousTag start (currentSHA=${ currentSHA }, semver=${ semanticVersion ? "enabled" : "disabled" })`);

    let best: {
      name: string;
      semver: ReturnType<typeof parseSemanticVersion>;
    } | null = null;
    let firstNonCurrent: string | null = null;

    for await (const record of streamRecords([
      "--no-pager",
      "for-each-ref",
      "--sort=-creatordate",
      `--format=%(refname:strip=2)${ FIELD_SEPARATOR }%(objectname)${ RECORD_SEPARATOR }`,
      "refs/tags",
    ])) {
      const [name] = record.split(FIELD_SEPARATOR);
      if (!name) continue;

      // Avoid selecting the tag that points exactly at current SHA.
      // We resolve the commit sha lazily via rev-list (only for selected candidate).
      firstNonCurrent ??= name;

      if (!semanticVersion) continue;

      const version = parseSemanticVersion(name);
      if (!version) continue;

      if (semanticVersion.compare(version) <= 0) continue;

      if (!best?.semver || best.semver.compare(version) < 0) {
        best = {
          name,
          semver: version,
        };
      }
    }

    const selectedName = semanticVersion ? (best ? best.name : null) : firstNonCurrent;
    if (!selectedName) {
      debug("[git-api] getPreviousTag done (no candidate tag)");
      return null;
    }

    const sha = await gitTrimmedStdout(["rev-list", "-n", "1", selectedName]);

    if (!sha || sha === currentSHA) {
      debug(`[git-api] getPreviousTag done (candidate=${ selectedName }, ignored=${ sha ? "points-to-current-sha" : "empty-sha" })`);
      return null;
    }

    debug(`[git-api] getPreviousTag done (name=${ selectedName }, sha=${ sha })`);
    return {
      name: selectedName,
      sha,
    };
  }

  public async *iterateCommits(fromSHA?: string): AsyncGenerator<TCommit> {
    const { currentSHA } = this;
    debug(`[git-api] iterateCommits start (fromSHA=${ fromSHA ?? "none" }, head=${ currentSHA })`);

    const args = [
      "--no-pager",
      "log",
      currentSHA,
      `--pretty=format:%H${ FIELD_SEPARATOR }%an${ FIELD_SEPARATOR }%ae${ FIELD_SEPARATOR }%s${ RECORD_SEPARATOR }`,
    ];
    const child = spawnGit(args);
    const command = formatGitCommand(args);

    if (!child.stdout) throw new Error("Failed to read git stdout.");

    let buffer = "";
    let stopped = false;

    const stopEarly = (): void => {
      if (stopped) return;
      stopped = true;
      child.kill();
    };

    try {
      for await (const chunk of child.stdout) {
        buffer += chunk.toString("utf8");

        let index = buffer.indexOf(RECORD_SEPARATOR);

        while (index !== -1) {
          const record = buffer.slice(0, index);
          buffer = buffer.slice(index + RECORD_SEPARATOR.length);

          if (!record) {
            index = buffer.indexOf(RECORD_SEPARATOR);
            continue;
          }

          const [shaValue, authorName, authorEmail, subject] = record.split(FIELD_SEPARATOR);
          if (!shaValue) {
            index = buffer.indexOf(RECORD_SEPARATOR);
            continue;
          }

          if (fromSHA && shaValue.trim() === fromSHA) {
            debug(`[git-api] iterateCommits stop (reached fromSHA=${ fromSHA })`);
            stopEarly();
            break;
          }

          /* eslint-disable no-await-in-loop -- must resolve login before yielding each commit */
          const login
            = (authorEmail ? await this.resolveGitHubLoginByEmail(authorEmail) : null)
              ?? (authorEmail ? authorEmail.split("@")[0] : null)
              ?? (authorName
                ? authorName.trim()
                    .toLowerCase()
                    .replaceAll(/\s+/g, "-")
                : null)
              ?? "unknown";

          yield {
            sha: shaValue.trim(),
            commit: { message: subject ?? "" },
            author: login ? { login } : null,
          };

          index = buffer.indexOf(RECORD_SEPARATOR);
        }

        if (stopped) break;
      }

      const exitCode = await waitForExit(child);

      if (!stopped && exitCode !== 0) {
        const stderr = await readAllStdError(child);
        debug(`[git] failed -> ${ command } (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
        throw new Error(`git log failed (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
      }

      debug(`[git-api] iterateCommits done (stopped=${ stopped })`);
    } finally {
      child.kill();
    }
  }

  protected async *listNewContributors(previousTagName?: string): AsyncGenerator<TNewContributor> {
    const { tagName } = this;
    debug(`[git-api] listNewContributors start (previous=${ previousTagName ?? "none" }, current=${ tagName })`);

    if (!previousTagName || previousTagName === tagName) {
      debug("[git-api] listNewContributors done (no comparable previous tag)");
      return;
    }

    const previousEmails = new Set<string>();

    // Use shortlog to avoid streaming per-commit author lines for large histories.
    {
      const args = ["--no-pager", "shortlog", "-sne", previousTagName];
      const child = spawnGit(args);
      const command = formatGitCommand(args);
      if (!child.stdout) throw new Error("Failed to read git stdout.");

      let buf = "";
      for await (const chunk of child.stdout) {
        buf += chunk.toString("utf8");
        let index = buf.indexOf("\n");
        while (index !== -1) {
          const line = buf.slice(0, index);
          buf = buf.slice(index + 1);
          const parsed = parseShortlogLine(line);
          if (parsed) previousEmails.add(parsed.email);
          index = buf.indexOf("\n");
        }
      }
      const exitCode = await waitForExit(child);
      if (exitCode !== 0) {
        const stderr = await readAllStdError(child);
        debug(`[git] failed -> ${ command } (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
        throw new Error(`git shortlog failed (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
      }
      debug(`[git] done -> ${ command }`);
    }

    const seen = new Set<string>();
    const range = `${ previousTagName }..${ tagName }`;
    const newContributors: Array<{
      email: string;
      name: string;
    }> = [];

    const args = ["--no-pager", "shortlog", "-sne", range];
    const child = spawnGit(args);
    const command = formatGitCommand(args);
    if (!child.stdout) throw new Error("Failed to read git stdout.");

    let buffer = "";
    for await (const chunk of child.stdout) {
      buffer += chunk.toString("utf8");
      let index = buffer.indexOf("\n");
      while (index !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        const parsed = parseShortlogLine(line);
        if (parsed) {
          const key = parsed.email.toLowerCase();
          if (!seen.has(key) && !previousEmails.has(parsed.email)) {
            seen.add(key);
            newContributors.push(parsed);
          }
        }
        index = buffer.indexOf("\n");
      }
    }

    const exitCode = await waitForExit(child);
    if (exitCode !== 0) {
      const stderr = await readAllStdError(child);
      debug(`[git] failed -> ${ command } (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
      throw new Error(`git shortlog failed (exit ${ exitCode })${ stderr ? `: ${ stderr.trim() }` : "" }`);
    }
    debug(`[git] done -> ${ command }`);

    const logins = await Promise.all(newContributors.map(async c => this.resolveGitHubLoginByEmail(c.email)));
    debug(`[git-api] listNewContributors resolved candidates=${ newContributors.length }`);
    for (const [i, contributor] of newContributors.entries()) {
      const login = logins[i];
      yield login
        ? { username: login }
        : {
            email: contributor.email,
            name: contributor.name,
          };
    }
  }

  private async resolveGitHubLoginByEmail(email: string): Promise<string | null> {
    if (this.emailToLogin.has(email)) {
      debug(`[git-api] resolveGitHubLoginByEmail cache-hit (${ email })`);
      return this.emailToLogin.get(email) ?? null;
    }

    const gitHub = getMaybeGitHubClient();
    if (!gitHub) {
      debug(`[git-api] resolveGitHubLoginByEmail skipped (no GitHub client, email=${ email })`);
      this.emailToLogin.set(email, null);
      return null;
    }

    try {
      debug(`[git-api] resolveGitHubLoginByEmail lookup start (${ email })`);
      const { data } = await gitHub.rest.search.users({
        q: `${ email } in:email`,
        per_page: 1,
      });

      const items = data.items;
      const first = items?.[0];
      const login = first?.login ?? null;
      this.emailToLogin.set(email, login);
      debug(`[git-api] resolveGitHubLoginByEmail lookup done (${ email } -> ${ login ?? "none" })`);
      return login;
    } catch {
      debug(`[git-api] resolveGitHubLoginByEmail lookup failed (${ email })`);
      this.emailToLogin.set(email, null);
      return null;
    }
  }

}
