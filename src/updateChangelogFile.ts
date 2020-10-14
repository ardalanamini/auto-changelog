import { info, getInput } from "@actions/core";
import * as fs from "fs";

export async function updateChangelogFile(changeLog: string): Promise<void> {
  let changeLogPath = getInput("path", { required: false });
  if (changeLogPath.length === 0) changeLogPath = "./CHANGELOG.md";
  info(`Updating changelog file at ${changeLogPath}`);

  let title = getInput("title", { required: false });
  if (title.length === 0) title = "# Changelog";

  let section = getInput("section", { required: false });
  if (section.length === 0)
    section = `## Release ${process.env.GITHUB_REF}`;

  let existingContent = "";
  fs.access(changeLogPath, fs.constants.F_OK, async (err) => {
    if (!err) {
      existingContent = (
        await fs.promises.readFile(changeLogPath)
      ).toString();
    }
  });

  const updatedContent = createNewContent(
    existingContent,
    changeLog,
    title,
    section,
  );

  info("Writing new or updated changelog file");
  await fs.promises.writeFile(changeLogPath, updatedContent);
}

function createNewContent(
  existingContent: string,
  newContent: string,
  title: string,
  section: string,
): string {
  let updatedContent = "";
  if (existingContent.length === 0) {
    updatedContent = `${title}\n\n${addNewReleaseSection(
      newContent,
      section,
    )}`;
  } else {
    // Remove original heading so we can add our new section then add it back
    const strippedContent = existingContent.replace(title, "").trim();

    const releaseSection = addNewReleaseSection(newContent, section);
    updatedContent = `${title}\n\n${releaseSection}${strippedContent}`;
  }
  return updatedContent;
}

function addNewReleaseSection(content: string, section: string): string {
  return `\n\n${section}\n\n${content}\n\n`;
}
