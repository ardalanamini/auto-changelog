import type { GitHub } from "@actions/github/lib/utils";

export async function generate(
  octokit: InstanceType<typeof GitHub>,
  exclude: string[],
  owner: string,
  repo: string,
  tagRef?: string,
): Promise<string> {
  exclude = exclude.map(
    (type) => (TYPES as { [type: string]: string | undefined })[type] ?? type,
  );

  const repoUrl = `https://github.com/${owner}/${repo}`;
  const commits: Logs = {};

  paginator: for await (const { data } of octokit.paginate.iterator(
    octokit.repos.listCommits,
    {
      per_page: 100,
      owner,
      repo,
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
      type =
        (TYPES as { [type: string]: string | undefined })[type] ?? TYPES.other;

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
    .sort()
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

const COMMIT_REGEX = /^([^)]*)(?:\(([^)]*?)\)|):(.*?)(?:\[([^\]]+?)\]|)\s*$/;
const PR_REGEX = /#([1-9]\d*)/g;

const TYPES = {
  breaking: "Breaking Changes",
  build: "Build System / Dependencies",
  ci: "Continuous Integration",
  chore: "Chores",
  docs: "Documentation Changes",
  feat: "New Features",
  fix: "Bug Fixes",
  other: "Other Changes",
  perf: "Performance Improvements",
  refactor: "Refactors",
  revert: "Reverts",
  style: "Code Style Changes",
  test: "Tests",
};

interface Logs {
  [type: string]: {
    [category: string]: Log[];
  };
}

interface Log {
  title: string;
  commits: string[];
}
