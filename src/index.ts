/*
 * MIT License
 *
 * Copyright (c) 2020-2023 Ardalan Amini
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
 *
 */

import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { marked } from "marked";
import { parse as parseSemVer, type SemVer } from "semver";
import { generate } from "./changelog.js";
import { getInputs, getToken } from "./context.js";
import { getTagSha } from "./tag.js";

async function run(): Promise<void> {
  const inputs = await getInputs();

  const octokit = getOctokit(getToken());

  const {
    repo: { owner, repo },
    sha,
  } = context;

  let semver: SemVer | null = null;

  if (inputs.semver) {
    semver = parseSemVer(inputs.releaseName, {
      includePrerelease: true,
    } as never);

    if (semver == null) {
      setFailed(`Expected a semver compatible releaseName, got "${ inputs.releaseName }" instead.`);

      return;
    }
  }

  let prerelease = false;
  let releaseId = "latest";

  if (semver != null) {
    prerelease = semver.prerelease.length > 0;

    if (prerelease) releaseId = semver.prerelease[0] as string;
  }

  const { sha: tagRef, name: tagName } = await getTagSha({
    octokit,
    owner,
    repo,
    sha,
    semver,
    prerelease,
  });

  let changelog = await generate({
    octokit,
    owner,
    repo,
    sha,
    tagRef,
    inputs,
  });

  if (inputs.mentionNewContributors) {
    const { data } = await octokit.rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name         : inputs.releaseName,
      previous_tag_name: tagName,
    });

    const tokens = marked.lexer(data.body);

    const index = tokens.findIndex(token => token.type === "heading" && token.text === "New Contributors");

    const token = tokens[index + 1];

    if (token.type === "list") changelog += `\n\n## New Contributors\n${ token.raw }\n`;
  }

  if (inputs.includeCompare && tagName != null) changelog += `\n\n**Full Changelog**: https://github.com/${ owner }/${ repo }/compare/${ tagName }...${ inputs.releaseName }`;

  info(`-> prerelease: ${ prerelease }`);

  setOutput("prerelease", prerelease);

  info(`-> release-id: ${ releaseId }`);

  setOutput("release-id", releaseId);

  info(`-> changelog: "${ changelog }"`);

  setOutput("changelog", changelog);
}

run().catch(setFailed);
