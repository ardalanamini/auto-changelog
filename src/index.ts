import { info, getInput, setOutput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { generate } from "./changelog";
import { updateChangelogFile } from "./updateChangelogFile";

async function run() {
  try {
    const token = getInput("token", { required: true });
    const exclude = getInput("exclude", { required: false }).split(",");
    const updateFile = getInput("generate", { required: false });
    const octokit = getOctokit(token);
    const {
      repo: { owner, repo },
      sha,
    } = context;

    const { data: tags } = await octokit.repos.listTags({
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

    const changelog = await generate(octokit, exclude, owner, repo, tagRef);

    info(changelog);

    setOutput("changelog", changelog);

    if (updateFile === "true") {
      await updateChangelogFile(octokit, changelog);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
