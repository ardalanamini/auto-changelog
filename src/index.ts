import { info, getInput, setOutput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import Changelog from "generate-changelog";

async function run() {
  try {
    const token = getInput("token", { required: true });
    const exclude = getInput("exclude", { required: false }).split(",");
    const allowUnknown =
      getInput("allow-unknown", { required: false }) === "true";
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

    let tag: string | undefined;

    if (tags.length > 0) {
      if (sha === tags[0].commit.sha) {
        if (tags.length > 1) tag = tags[1].name;
      } else tag = tags[0].name;
    }

    let changelog = await Changelog.generate({
      repoUrl: `https://github.com/${owner}/${repo}`,
      tag,
      exclude,
      allowUnknown,
    });

    changelog = changelog.replace(/^#+ +(\d)/, "#### v$1");

    info(changelog);

    setOutput("changelog", changelog);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
