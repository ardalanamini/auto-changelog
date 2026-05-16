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

import { debug } from "@actions/core";
import { marked } from "marked";
import { type MonorepoContext, parsePackageTagSemanticVersion, shouldIncludeCommit } from "#monorepo";
import { octokit, parseSemanticVersion } from "#utils";
/* eslint-disable @stylistic/key-spacing -- conflicts with type-annotation-spacing in type definitions */
import { type TCommit, type TNewContributor, type TTag, APIBase } from "./api.js";

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  return String(error);
}

function gitHubAPIError(message: string, cause: unknown): Error & { code: "GITHUB_API_ERROR"; } {
  const code = "GITHUB_API_ERROR" as const;
  const error = Object.assign(new Error(message, { cause }), { code });
  error.name = "GitHubAPIError";

  return error;
}

export class GitHubAPI extends APIBase {

  public readonly gitHub = octokit();

  public async getNewContributors(previousTagName?: string): Promise<string | null> {
    try {
      return await this.formatNewContributors(previousTagName);
    } catch (error) {
      const { repository, tagName } = this;
      debug(`[github-api] getNewContributors failed (${ repository.owner }/${ repository.repo }, tag=${ tagName }, previousTag=${ previousTagName ?? "none" }): ${ formatErrorMessage(error) }`);
      return null;
    }
  }

  public async getPreviousTag(monorepoContext?: MonorepoContext | null): Promise<TTag | null> {
    const { gitHub, repository, currentSHA, semanticVersion } = this;

    try {
      let best: {
        name: string;
        sha: string;
        version: NonNullable<ReturnType<typeof parseSemanticVersion>>;
      } | null = null;

      const iterator = gitHub.paginate.iterator(
        gitHub.rest.repos.listTags,
        {
          per_page: 100,
          owner   : repository.owner,
          repo    : repository.repo,
        },
      );

      for await (const { data } of iterator) {
        for (const { name, commit } of data) {
          if (currentSHA === commit.sha) continue;
          if (monorepoContext && !name.startsWith(monorepoContext.tagPrefix)) continue;

          if (semanticVersion == null) {
            return {
              name,
              sha: commit.sha,
            };
          }

          const version = monorepoContext
            ? parsePackageTagSemanticVersion(name, monorepoContext.selectedPackage.name)
            : parseSemanticVersion(name);

          if (version == null || semanticVersion.compare(version) <= 0) continue;

          if (best == null || version.compare(best.version) > 0) {
            best = {
              name,
              sha: commit.sha,
              version,
            };
          }
        }
      }

      if (best != null) {
        return {
          name: best.name,
          sha : best.sha,
        };
      }
    } catch (error) {
      throw gitHubAPIError(`Failed to get previous tag for ${ repository.owner }/${ repository.repo } at ${ currentSHA }.`, error);
    }

    return null;
  }

  public async *iterateCommits(fromSHA?: string, monorepoContext?: MonorepoContext | null): AsyncGenerator<TCommit> {
    const { gitHub, repository, currentSHA } = this;
    const path = monorepoContext?.includeRootCommits === "false"
      ? monorepoContext.selectedPackage.path
      : void 0;

    try {
      const iterator = gitHub.paginate.iterator(
        gitHub.rest.repos.listCommits,
        {
          per_page: 100,
          owner   : repository.owner,
          path,
          repo    : repository.repo,
          sha     : currentSHA,
        },
      );

      loop: for await (const { data } of iterator) {
        for (const commit of data) {
          if (fromSHA === commit.sha) break loop;

          if (!monorepoContext || monorepoContext.includeRootCommits === "false") {
            yield {
              author: commit.author && { login: commit.author.login },
              commit: commit.commit,
              sha   : commit.sha,
            };
            continue;
          }

          /* eslint-disable-next-line no-await-in-loop -- package mode needs per-commit file data */
          const files = await this.listCommitFiles(commit.sha);

          if (!shouldIncludeCommit(files, monorepoContext)) continue;

          yield {
            author: commit.author && { login: commit.author.login },
            commit: commit.commit,
            sha   : commit.sha,
            files,
          };
        }
      }
    } catch (error) {
      throw gitHubAPIError(`Failed to iterate commits for ${ repository.owner }/${ repository.repo } from SHA ${ fromSHA ?? "beginning" } at ${ currentSHA }.`, error);
    }
  }

  protected async *listNewContributors(previousTagName?: string): AsyncGenerator<TNewContributor> {
    const { gitHub, repository, tagName } = this;

    let data: Awaited<ReturnType<typeof gitHub.rest.repos.generateReleaseNotes>>["data"];

    try {
      ({ data } = await gitHub.rest.repos.generateReleaseNotes({
        owner            : repository.owner,
        repo             : repository.repo,
        tag_name         : tagName,
        previous_tag_name: previousTagName,
      }));
    } catch (error) {
      throw gitHubAPIError(`Failed to list new contributors for ${ repository.owner }/${ repository.repo } from ${ previousTagName ?? "beginning" } to ${ tagName }.`, error);
    }

    const tokens = marked.lexer(data.body);

    const index = tokens.findIndex(markdownToken => markdownToken.type === "heading"
      && markdownToken.text === "New Contributors");

    if (index === -1) return;

    const markdownToken = tokens.at(index + 1);

    if (markdownToken?.type !== "list") return;

    for (const item of markdownToken.items) {
      // TODO: Implement logic to extract pr/commit from item.text
      //
      // Sample:
      // ## New Contributors
      // * @darksaid98 made their first contribution in https://github.com/ardalanamini/auto-changelog/pull/221
      const username = item.text.match(/^@(?<username>[\dA-Za-z](?:[\dA-Za-z-]*[\dA-Za-z])?(?:\[bot])?)(?:\s|$)/)?.groups?.username;

      if (!username) continue;

      yield {
        username,
      };
    }
  }

  private async listCommitFiles(commitSHA: string): Promise<string[]> {
    const { gitHub, repository } = this;

    const { data } = await gitHub.rest.repos.getCommit({
      owner: repository.owner,
      ref  : commitSHA,
      repo : repository.repo,
    });

    return data.files?.map(file => file.filename) ?? [];
  }

}
