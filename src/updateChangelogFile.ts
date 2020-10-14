import { info, getInput } from "@actions/core";
import * as fs from "fs";

export async function updateChangelogFile(changeLog: string): Promise<void> {
  let changeLogFilePath = getInput("changeLogFilePath", { required: false });
  if (changeLogFilePath.length === 0) changeLogFilePath = "./CHANGELOG.md";
  info(`Updating changelog file at ${changeLogFilePath}`);

  let fileHeading = getInput("fileHeading", { required: false });
  if (fileHeading.length === 0) fileHeading = "# Changelog";

  let sectionHeading = getInput("sectionHeading", { required: false });
  if (sectionHeading.length === 0)
    sectionHeading = `## Release ${process.env.GITHUB_REF}`;

  let existingContent = "";
  if (await fs.promises.stat(changeLogFilePath)) {
    existingContent = (
      await fs.promises.readFile(changeLogFilePath)
    ).toString();
  }

  const updatedContent = createNewContent(
    existingContent,
    changeLog,
    fileHeading,
    sectionHeading,
  );

  info("Writing new or updated changelog file");
  await fs.promises.writeFile(changeLogFilePath, updatedContent);
}

function createNewContent(
  existingContent: string,
  newContent: string,
  fileHeading: string,
  sectionHeading: string,
): string {
  let updatedContent = "";
  if (existingContent.length === 0) {
    updatedContent = `${fileHeading}\r\r${addNewReleaseSection(
      newContent,
      sectionHeading,
    )}`;
  } else {
    // Remove original heading so we can add our new section then add it back
    const strippedContent = existingContent.replace(fileHeading, "").trim();

    const releaseSection = addNewReleaseSection(newContent, sectionHeading);
    updatedContent = `${fileHeading}\r\r${releaseSection}${strippedContent}`;
  }
  return updatedContent;
}

function addNewReleaseSection(content: string, sectionHeading: string): string {
  return `\r\r${sectionHeading}\r\r${content}\r\r`;
}
