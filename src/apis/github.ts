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

import { marked } from "marked";
import { octokit, parseSemanticVersion } from "#utils";
import { type TCommit, type TNewContributor, type TTag, APIBase } from "./api.js";

export class GitHubAPI extends APIBase {

  public readonly gitHub = octokit();

  public async getNewContributors(previousTagName?: string): Promise<string | null> {
    const { repository, tagName, gitHub } = this;

    const { data } = await gitHub.rest.repos.generateReleaseNotes({
      owner            : repository.owner,
      repo             : repository.repo,
      tag_name         : tagName,
      previous_tag_name: previousTagName,
    });

    const tokens = marked.lexer(data.body);

    const index = tokens.findIndex(markdownToken => markdownToken.type === "heading"
      && markdownToken.text === "New Contributors");

    if (index === -1) return null;

    const markdownToken = tokens[index + 1];

    if (markdownToken.type === "list") return `## New Contributors\n${ markdownToken.raw }\n`;

    return null;
  }

  public async getPreviousTag(): Promise<TTag | null> {
    const { gitHub, repository, currentSHA, semanticVersion } = this;

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

        if (semanticVersion == null) {
          return {
            name,
            sha: commit.sha,
          };
        }

        const version = parseSemanticVersion(name);

        if (version == null || semanticVersion.compare(version) <= 0) continue;

        // if (version.prerelease.length > 0 && !prerelease) continue;

        return {
          name,
          sha: commit.sha,
        };
      }
    }

    return null;
  }

  public async *iterateCommits(fromSHA?: string): AsyncGenerator<TCommit> {
    const { gitHub, repository, currentSHA } = this;

    const iterator = gitHub.paginate.iterator(
      gitHub.rest.repos.listCommits,
      {
        per_page: 100,
        owner   : repository.owner,
        repo    : repository.repo,
        sha     : currentSHA,
      },
    );

    loop: for await (const { data } of iterator) {
      for (const commit of data) {
        if (fromSHA === commit.sha) break loop;

        yield commit;
      }
    }
  }

  protected async *listNewContributors(previousTagName?: string): AsyncGenerator<TNewContributor> {
    const { gitHub, repository, tagName } = this;

    const { data } = await gitHub.rest.repos.generateReleaseNotes({
      owner            : repository.owner,
      repo             : repository.repo,
      tag_name         : tagName,
      previous_tag_name: previousTagName,
    });

    const tokens = marked.lexer(data.body);

    const index = tokens.findIndex(markdownToken => markdownToken.type === "heading"
      && markdownToken.text === "New Contributors");

    if (index === -1) return;

    const markdownToken = tokens[index + 1];

    if (markdownToken.type !== "list") return;

    for (const item of markdownToken.items) {
      // TODO: Implement logic to extract pr/commit from item.text
      //
      // Sample:
      // ## New Contributors
      // * @darksaid98 made their first contribution in https://github.com/ardalanamini/auto-changelog/pull/221
      const [username] = item.text.split(" ");

      yield {
        username: username.slice(1),
      };
    }
  }

}
