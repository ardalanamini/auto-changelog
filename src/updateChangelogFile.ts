import { info } from "@actions/core";
import { context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import * as fs from "fs";

export async function updateChangelogFile(
  octokit: InstanceType<typeof GitHub>,
  changeLogPath: string,
  changeLog: string,
): Promise<void> {
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
    path: changeLogPath,
    content: updatedContent,
    owner: context.repo.owner,
    message: `chore: updating change log [skip ci]`,
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
  sectionHeading: string,
): string {
  let updatedContent = "";
  if (existingContent.length === 0) {
    updatedContent = `${title}\n\n${addNewReleaseSection(sectionHeading, newContent)}`;
  } else {
    const releaseSection = addNewReleaseSection(sectionHeading, newContent);

    // Find last release heading which will be a level 2 head: '## '
    const lastReleaseIndex = existingContent.indexOf('\n## ');
    if (lastReleaseIndex === -1) {
      // Should never get here really, but if we do append the new changelog to the end
      updatedContent = `${existingContent}\n\n${releaseSection}`;
    } else {
      updatedContent = `${existingContent.substr(0, lastReleaseIndex).trim()}\n\n${releaseSection}${existingContent.substr(lastReleaseIndex).trim()}`;
    }
  }

  return updatedContent.trim();
}

function addNewReleaseSection(section: string, content: string): string {
  return `${section}\n\n${content}\n\n`;
}
