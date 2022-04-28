import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import SemVer from "semver";
import { getTagSha } from "./tag.js";
import { generate } from "./changelog";
import { getInputs, getToken } from "./context";

async function run() {
  const inputs = await getInputs();

  const octokit = getOctokit(getToken());

  const {
    repo: { owner, repo },
    sha,
    ref,
  } = context;

  let semver: SemVer.SemVer | null = null;

  if (inputs.semver) {
    semver = SemVer.parse(ref, { includePrerelease: true });

    if (semver == null)
      return setFailed(
        `Expected a semver compatible ref, got "${ref}" instead.`,
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
