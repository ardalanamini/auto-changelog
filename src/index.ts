import { info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { generate } from "./changelog";
import { getInputs, getToken } from "./context";

async function run() {
  const inputs = await getInputs();

  const octokit = getOctokit(getToken());

  const {
    repo: { owner, repo },
    sha,
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
}

run().catch((error) => setFailed(error.message));
