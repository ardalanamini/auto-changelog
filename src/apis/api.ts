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
import { type SemVer } from "semver";
import {
  includeCompareLink,
  mentionNewContributors,
  releaseName,
  releaseNamePrefix,
  tagPattern,
  useGitHubAutolink,
  useSemver,
} from "#inputs";
import {
  type MonorepoContext,
  detectMonorepoContext,
  parsePackageTagSemanticVersion,
} from "#monorepo";
import { ChangelogNode } from "#nodes";
import { setChangelog, setPackageName, setPackagePath, setPrerelease, setReleaseId } from "#outputs";
import { parseCommitMessage, parseSemanticVersion, repository as repositoryUtility, sha, trim } from "#utils";

export abstract class APIBase {

  public readonly currentSHA = sha();

  public readonly repository = repositoryUtility();

  public readonly semver = useSemver();

  public readonly tagName = releaseName();

  /**
   * Generates and sets release metadata and changelog content based on the latest tag information.
   *
   * Retrieves tag details, updates prerelease status and release ID, generates the changelog and footer,
   * and sets the complete changelog output.
   */
  public async generate(): Promise<void> {
    const monorepoContext = await detectMonorepoContext();
    const { prerelease, releaseId, previous } = await this.getTagInfo(monorepoContext);

    setPrerelease(prerelease);

    setReleaseId(releaseId);

    setPackageName(monorepoContext?.selectedPackage.name ?? "");

    setPackagePath(monorepoContext?.selectedPackage.path ?? "");

    let changelog = await this.generateChangelog(previous?.sha, monorepoContext);

    changelog += await this.generateFooter(previous?.name);

    setChangelog(changelog);
  }

  /**
   * Generates a changelog string from commit history, grouping entries by type, scope, and author.
   *
   * Iterates over repository commits starting from an optional commit SHA,
   * parses commit messages, and organizes them into a hierarchical changelog structure.
   * Commits with empty descriptions or flagged as "ignore" are excluded.
   * The resulting changelog is returned as a formatted string or an empty string if no valid entries are found.
   *
   * @param lastSha - Optional SHA of the last processed commit; if provided, only newer commits are included.
   * @returns The formatted changelog string, or an empty string if there are no relevant commits.
   */
  public async generateChangelog(lastSha?: string, monorepoContext?: MonorepoContext | null): Promise<string> {
    const changelogNode = new ChangelogNode();

    for await (const commit of this.iterateCommits(lastSha, monorepoContext)) {
      const message = commit.commit.message.split("\n")[0];

      debug(`commit message -> ${ message } (${ commit.sha })`);

      let { type, scope, description, pr, flag, breaking } = parseCommitMessage(message);

      description = trim(description);

      if (!description) continue;

      flag = trim(flag);

      if (flag === "ignore") continue;

      const typeNode = changelogNode.addType(type);

      const scopeNode = typeNode.addScope(scope);

      const commitNote = scopeNode.addCommit(description, breaking);

      const authorNode = commitNote.addAuthor(commit.author?.login);

      authorNode.addReference(commit.sha, pr);
    }

    const changelog = changelogNode.print();

    if (changelog) return `${ changelog }\n`;

    return "";
  }

  /**
   * Generates a markdown-formatted footer for a release note,
   * optionally including new contributors and a changelog link.
   *
   * If enabled by configuration, the footer may include a "New Contributors" section extracted
   * from GitHub-generated release notes and a "Full Changelog" link comparing the previous and current release tags.
   *
   * @param previousTagName - The previous release tag to compare against, if available.
   * @returns The formatted footer string, or an empty string if no sections are included.
   */
  public async generateFooter(previousTagName?: string): Promise<string> {
    const { repository, tagName } = this;

    if (previousTagName === tagName) return "";

    const footer: string[] = [];

    if (mentionNewContributors()) {
      const newContributors = await this.getNewContributors(previousTagName);

      if (newContributors != null) footer.push(newContributors);
    }

    if (includeCompareLink() && previousTagName) {
      let link = `${ repository.url }/compare/${ previousTagName }...${ tagName }`;

      if (!useGitHubAutolink() || releaseNamePrefix()) link = `[\`${ previousTagName }...${ tagName }\`](${ link })`;

      footer.push(`**Full Changelog**: ${ link }`);
    }

    if (footer.length > 0) footer.unshift("");

    return footer.join("\n\n");
  }

  public async getTagInfo(monorepoContext?: MonorepoContext | null): Promise<TTagInfo> {
    const { releaseId, prerelease } = this.getCurrentTagInfo(monorepoContext);

    const info: TTagInfo = {
      releaseId : releaseId,
      prerelease: prerelease,
    };

    const previousTag = await this.getPreviousTag(monorepoContext, tagPattern());

    if (previousTag != null) info.previous = previousTag;

    return info;
  }

  protected async formatNewContributors(previousTagName?: string): Promise<string | null> {
    const contributors: string[] = [];

    for await (const c of this.listNewContributors(previousTagName)) {
      if ("username" in c) contributors.push(`* @${ c.username }`);
      else contributors.push(`* ${ c.name } <${ c.email }>`);
    }

    if (contributors.length === 0) return null;

    return `## New Contributors\n${ contributors.join("\n") }\n`;
  }

  protected getCurrentSemanticVersion(monorepoContext?: MonorepoContext | null): SemVer | null {
    if (!this.semver) return null;

    const semanticVersion = monorepoContext
      ? parsePackageTagSemanticVersion(this.tagName, monorepoContext.selectedPackage.name)
      : parseSemanticVersion(this.tagName);

    if (semanticVersion == null) throw new Error(`Expected a semver compatible releaseName, got "${ this.tagName }" instead.`);

    return semanticVersion;
  }

  protected getCurrentTagInfo(monorepoContext?: MonorepoContext | null): Pick<TTagInfo, "prerelease" | "releaseId"> {
    const semanticVersion = this.getCurrentSemanticVersion(monorepoContext);

    if (semanticVersion == null) {
      return {
        releaseId : "latest",
        prerelease: false,
      };
    }

    const prerelease = semanticVersion.prerelease.length > 0;

    return {
      prerelease,
      releaseId: prerelease ? `${ semanticVersion.prerelease[0] }` : "latest",
    };
  }

  public abstract getNewContributors(previousTagName?: string): Promise<string | null>;

  public abstract getPreviousTag(monorepoContext?: MonorepoContext | null, pattern?: string): Promise<TTag | null>;

  public abstract iterateCommits(fromSHA?: string, monorepoContext?: MonorepoContext | null): AsyncGenerator<TCommit>;

  protected abstract listNewContributors(previousTagName?: string): AsyncGenerator<TNewContributor>;

}

export interface TCommit {
  author?: {
    login: string;
  } | null;

  commit: {
    message: string;
  };

  files?: string[];

  sha: string;
}

export interface TTag {
  name: string;

  sha: string;
}

export interface TTagInfo {
  prerelease: boolean;

  previous?: TTag;

  releaseId: string;
}

export type TNewContributor = {
  username: string;
} | {
  email: string;

  name: string;
};
