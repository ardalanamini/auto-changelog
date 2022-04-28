import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import SemVer from "semver";
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

  const { data: tags } = await octokit.rest.repos.listTags({
    owner,
    repo,
    per_page: 2,
  });

  let tagRef: string | undefined;

  if (tags.length > 0) {
    if (sha === tags[0].commit.sha) {
      if (tags.length > 1) tagRef = tags[1].commit.sha;
    } else tagRef = tags[0].commit.sha;
  }

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

  let prerelease = false;

  if (inputs.semver) {
    const semver = SemVer.parse(ref, { includePrerelease: true });

    if (semver != null) prerelease = semver.prerelease.length > 0;
  }

  info(`prerelease: ${prerelease}`);

  setOutput("prerelease", prerelease);
}

run().catch((error) => setFailed(error.message));
