import { COMMIT_REGEX, InputI, LogsI, PR_REGEX, TYPES } from "./constants";

export async function generate(input: InputI): Promise<string> {
  const { octokit, exclude, owner, repo, sha, tagRef } = input;

  const repoUrl = `https://github.com/${owner}/${repo}`;
  const commits: LogsI = {};

  paginator: for await (const { data } of octokit.paginate.iterator(
    octokit.rest.repos.listCommits,
    {
      per_page: 100,
      owner,
      repo,
      sha,
    },
  )) {
    for (const { sha, ...commit } of data) {
      if (sha === tagRef) break paginator;

      const message = commit.commit.message.split("\n")[0];

      let [, type, category, title, flag] = COMMIT_REGEX.exec(message) || [];

      if (!title) continue;

      flag = trim(flag);
      if (flag === "ignore") continue;

      type = trim(type);
      type = TYPES[type] ?? TYPES.other;

      category = category ? trim(category) : "";

      title = trim(title).replace(
        PR_REGEX,
        (match, pull) => `[${match}](${repoUrl}/pull/${pull})`,
      );

      commits[type] = commits[type] ?? {};
      commits[type][category] = commits[type][category] ?? [];

      const existingIndex = commits[type][category].findIndex(
        (commit) => commit.title === title,
      );

      if (existingIndex === -1)
        commits[type][category].push({ title, commits: [sha] });
      else commits[type][category][existingIndex].commits.push(sha);
    }
  }

  return Object.values(TYPES)
    .filter((type) => !exclude.includes(type))
    .reduce((changelog, type) => {
      const typeGroup = commits[type];

      if (typeGroup == null) return changelog;

      changelog.push(`### ${type}`, "");

      const categories = Object.keys(typeGroup).sort();

      for (const category of categories) {
        const categoryGroup = typeGroup[category];
        const defaultCategory = category.length === 0;

        if (!defaultCategory) changelog.push(`* **${category}:**`);

        const baseLine = defaultCategory ? "" : "  ";

        for (const { title, commits } of categoryGroup) {
          changelog.push(
            `${baseLine}* ${title} (${commits
              .map((sha) => `[${sha.slice(0, 8)}](${repoUrl}/commit/${sha})`)
              .join(",")})`,
          );
        }
      }

      changelog.push("");

      return changelog;
    }, [] as string[])
    .join("\n");
}

function trim(value: string): string {
  if (value == null) return value;

  return value.trim().replace(/ {2,}/g, " ");
}
