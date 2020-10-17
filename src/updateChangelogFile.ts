import { info } from "@actions/core";
import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import * as fs from "fs";

export async function updateChangelogFile(
  octokit: InstanceType<typeof GitHub>,
  changeLog: string,
): Promise<void> {
  const changeLogPath = "./CHANGELOG.md";
  info(`Updating changelog file at ${changeLogPath}`);

  const title = `# ${context.repo.repo}`;
  const section = `## Release ${new Date().toISOString().substr(0, 10)}`;

  let existingContent = "";
  fs.access(changeLogPath, fs.constants.F_OK, async (err) => {
    if (!err) {
      existingContent = (await fs.promises.readFile(changeLogPath)).toString();
    }
  });

  const updatedContent = createNewContent(
    existingContent,
    changeLog,
    title,
    section,
  );

  info("Writing new or updated changelog file");
  await octokit.repos.createOrUpdateFileContents({
    repo: context.repo.repo,
    path: "./CHANGELOG.md",
    content: updatedContent,
    owner: context.repo.owner,
    message: "chore(pipeline updates): [skip ci]",
    author: {
      name: "GitHub CI",
      email: "ci@github.com",
    },
  });
}

function createNewContent(
  existingContent: string,
  newContent: string,
  title: string,
  section: string,
): string {
  let updatedContent = "";
  if (existingContent.length === 0) {
    updatedContent = `${title}\n\n${addNewReleaseSection(newContent, section)}`;
  } else {
    // Remove original heading so we can add our new section then add it back
    const strippedContent = existingContent
      .trim()
      .replace(/^# .*?\n+/g, "")
      .trim();

    const releaseSection = addNewReleaseSection(newContent, section);
    updatedContent = `${title}\n\n${releaseSection}${strippedContent}`;
  }
  return updatedContent.trim();
}

function addNewReleaseSection(content: string, section: string): string {
  return `${section}\n\n${content}\n\n`;
}
