/**
 * MIT License
 *
 * Copyright (c) 2020-2025 Ardalan Amini
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
import {
  includeCompareLink,
  mentionNewContributors,
  releaseName,
  releaseNamePrefix,
  useGitHubAutolink,
} from "#inputs";
import { octokit, repository } from "#utils";

/**
 * Generates a markdown-formatted footer for a release note, optionally including new contributors and a changelog link.
 *
 * If enabled by configuration, the footer may include a "New Contributors" section extracted
 * from GitHub-generated release notes and a "Full Changelog" link comparing the previous and current release tags.
 *
 * @param previousTagName - The previous release tag to compare against, if available.
 * @returns The formatted footer string, or an empty string if no sections are included.
 */
export async function generateFooter(previousTagName?: string): Promise<string> {
  const { owner, repo, url } = repository();
  const tagName = releaseName();

  const footer: string[] = [];

  if (mentionNewContributors()) {
    const { rest } = octokit();

    const { data } = await rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name         : tagName,
      previous_tag_name: previousTagName,
    });

    const tokens = marked.lexer(data.body);

    // eslint-disable-next-line @stylistic/max-len
    const index = tokens.findIndex(markdownToken => markdownToken.type === "heading" && markdownToken.text === "New Contributors");

    const markdownToken = tokens[index + 1];

    if (markdownToken.type === "list") footer.push(`## New Contributors\n${ markdownToken.raw }\n`);
  }

  if (includeCompareLink() && previousTagName) {
    let link = `${ url }/compare/${ previousTagName }...${ tagName }`;

    if (!useGitHubAutolink() || releaseNamePrefix()) link = `[\`${ previousTagName }...${ tagName }\`](${ url }/compare/${ previousTagName }...${ tagName })`;

    footer.push(`**Full Changelog**: ${ link }`);
  }

  if (footer.length > 0) footer.unshift("");

  return footer.join("\n\n");
}
