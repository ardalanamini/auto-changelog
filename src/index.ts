import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
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

  if (inputs.includeCompare && tagName != null) {
    changelog += `\n\n**Full Changelog**: https://github.com/${owner}/${repo}/compare/${tagName}...${inputs.releaseName}`;
  }

  info(`-> prerelease: ${prerelease}`);

  setOutput("prerelease", prerelease);

  info(`-> changelog: "${changelog}"`);

  setOutput("changelog", changelog);
}

run().catch(setFailed);
