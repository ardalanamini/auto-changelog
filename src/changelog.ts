import { ChangelogInputI, COMMIT_REGEX, LogsI, ReferenceI } from "./constants";

export async function generate(input: ChangelogInputI): Promise<string> {
  const { octokit, owner, repo, sha, tagRef, inputs } = input;
  const { commitTypes, defaultCommitType, mentionAuthors } = inputs;

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
    for (const commit of data) {
      if (commit.sha === tagRef) break paginator;

      const message = commit.commit.message.split("\n")[0];

      // eslint-disable-next-line prefer-const
      let { type, category, title, pr, flag } =
        COMMIT_REGEX.exec(message)?.groups ?? {};

      if (!title) continue;

      flag = trim(flag);

      if (flag === "ignore") continue;

      type = commitTypes[trim(type)] ?? defaultCommitType;

      category = category ? trim(category) : "";

      title = trim(title);

      if (commits[type] == null) commits[type] = {};

      if (commits[type][category] == null) commits[type][category] = [];

      const logs = commits[type][category];

      const existingCommit = logs.find((commit) => commit.title === title);

      const reference: ReferenceI = {
        author: mentionAuthors ? commit.author?.login : undefined,
        commit: commit.sha,
        pr,
      };

      if (existingCommit == null) logs.push({ title, references: [reference] });
      else existingCommit.references.push(reference);
    }
  }

  const TYPES = unique([...Object.values(commitTypes), defaultCommitType]);

  return TYPES.reduce<string[]>((changelog, type) => {
    const typeGroup = commits[type];

    if (typeGroup == null) return changelog;

    changelog.push(`## ${type}`);

    const categories = Object.keys(typeGroup).sort();

    for (const category of categories) {
      const categoryGroup = typeGroup[category];
      const defaultCategory = category.length === 0;

      if (!defaultCategory) changelog.push(`* **${category}:**`);

      const baseLine = defaultCategory ? "" : "  ";

      for (const { title, references } of categoryGroup) {
        changelog.push(
          `${baseLine}* ${title} (${references
            .map(
              (reference) =>
                `${
                  reference.pr == null ? "" : `${repoUrl}/pull/${reference.pr} `
                }${repoUrl}/commit/${reference.commit}${
                  reference.author == null ? "" : ` by @${reference.author}`
                }`,
            )
            .join(", ")})`,
        );
      }
    }

    changelog.push("");

    return changelog;
  }, []).join("\n");
}

function trim(value: string): string {
  if (value == null) return value;

  return value.trim().replace(/ {2,}/g, " ");
}

function unique(value: string[]): string[] {
  return [...new Set(value)];
}
