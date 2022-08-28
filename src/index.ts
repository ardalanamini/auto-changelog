import SemVer from "semver";
import { generate } from "./changelog.js";
import { getTagSha } from "./tag.js";
import { marked } from "marked";
import { context, getOctokit } from "@actions/github";
import { getInputs, getToken } from "./context.js";
import { info, setFailed, setOutput } from "@actions/core";

async function run(): Promise<void> {
  const inputs = await getInputs();

  const octokit = getOctokit(getToken());

  const {
    repo: { owner, repo },
    sha,
  } = context;

  let semver: SemVer.SemVer | null = null;

  if (inputs.semver) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    semver = SemVer.parse(inputs.releaseName, { includePrerelease: true } as any);

    if (semver == null) {
      setFailed(`Expected a semver compatible releaseName, got "${ inputs.releaseName }" instead.`);

      return;
    }
  }

  let prerelease = false;
  let releaseId = "latest";

  if (semver != null) {
    prerelease = semver.prerelease.length > 0;
    releaseId = semver.prerelease[0] as string;
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
