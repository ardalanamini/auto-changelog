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

  const tagRef = await getTagSha({
    octokit,
    owner,
    repo,
    sha,
    semver,
    prerelease,
  });

  const changelog = await generate({
    octokit,
    owner,
    repo,
    sha,
    tagRef,
    inputs,
  });

  info(changelog);

  setOutput("changelog", changelog);

  info(`prerelease: ${prerelease}`);

  setOutput("prerelease", prerelease);
}

run().catch(setFailed);
