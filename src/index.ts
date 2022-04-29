import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { marked } from "marked";
import SemVer from "semver";
import { getTagSha } from "./tag.js";
import { generate } from "./changelog.js";
import { getInputs, getToken } from "./context.js";

async function run() {
  const inputs = await getInputs();

  const octokit = getOctokit(getToken());

  const {
    repo: { owner, repo },
    sha,
  } = context;

  let semver: SemVer.SemVer | null = null;

  if (inputs.semver) {
    semver = SemVer.parse(inputs.releaseName, { includePrerelease: true });

    if (semver == null)
      return setFailed(
        `Expected a semver compatible releaseName, got "${inputs.releaseName}" instead.`,
      );
  }

  let prerelease = false;

  if (semver != null) prerelease = semver.prerelease.length > 0;

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
      tag_name: inputs.releaseName,
      previous_tag_name: tagName,
    });

    const tokens = marked.lexer(data.body);

    const index = tokens.findIndex(
      (token) => token.type === "heading" && token.text === "New Contributors",
    );

    const token = tokens[index + 1];

    if (token.type === "list")
      changelog += `\n\n## New Contributors\n${token.raw}\n`;
  }

  if (inputs.includeCompare && tagName != null) {
    changelog += `\n\n**Full Changelog**: https://github.com/${owner}/${repo}/compare/${tagName}...${inputs.releaseName}`;
  }

  info(`-> prerelease: ${prerelease}`);

  setOutput("prerelease", prerelease);

  info(`-> changelog: "${changelog}"`);

  setOutput("changelog", changelog);
}

run().catch(setFailed);
