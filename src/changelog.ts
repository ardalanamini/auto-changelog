import {
  APP_AUTHOR_SUFFIX,
  APP_AUTHOR_SUFFIX_LENGTH,
  COMMIT_REGEX,
  ChangelogInputI,
  LogsI,
  ReferenceI,
} from "./constants";

function trim(value: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (value == null) return value;

  return value.trim().replace(/ {2,}/g, " ");
}

function unique(value: string[]): string[] {
  return [...new Set(value)];
}

export async function generate(input: ChangelogInputI): Promise<string> {
  const { octokit, owner, repo, sha, tagRef, inputs } = input;
  const { commitTypes, defaultCommitType, mentionAuthors, includePRLinks, includeCommitLinks } = inputs;

  const repoUrl = `https://github.com/${ owner }/${ repo }`;
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

      let { type, category, title, pr, flag } = COMMIT_REGEX.exec(message)?.groups ?? {};

      if (!title) continue;

      flag = trim(flag);

      if (flag === "ignore") continue;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      type = commitTypes[trim(type)] ?? defaultCommitType;

      category = category ? trim(category) : "";

      title = trim(title);

      let types = commits[type];

      if (types == null) types = commits[type] = {};

      let logs = types[category];

      if (logs == null) logs = types[category] = [];

      const existingCommit = logs.find(log => log.title === title);

      const reference: ReferenceI = {
        author: mentionAuthors ? commit.author?.login : null,
        commit: includeCommitLinks ? commit.sha : null,
        pr    : includePRLinks ? pr : null,
      };

      if (existingCommit == null) {
        logs.push({
          title,
          references: [reference],
        });
      } else {
        existingCommit.references.push(reference);
      }
    }
  }

  const TYPES = unique([...Object.values(commitTypes), defaultCommitType]);

  return TYPES.reduce<string[]>((changelog, type) => {
    const typeGroup = commits[type];

    if (typeGroup == null) return changelog;

    changelog.push(`## ${ type }`);

    const categories = Object.keys(typeGroup).sort();

    for (const category of categories) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const categoryGroup = typeGroup[category]!;
      const defaultCategory = category.length === 0;

      if (!defaultCategory) changelog.push(`* **${ category }:**`);

      const baseLine = defaultCategory ? "" : "  ";

      for (const { title, references } of categoryGroup) {
        let log = `${ baseLine }* ${ title }`;

        const links: string[] = [];

        for (const { pr, commit, author } of references) {
          const link: string[] = [];

          if (pr != null) link.push(`${ repoUrl }/pull/${ pr }`);

          if (commit != null) link.push(`${ repoUrl }/commit/${ commit }`);

          if (author != null) {
            // eslint-disable-next-line max-depth
            if (author.endsWith(APP_AUTHOR_SUFFIX)) link.push(`by [@${ author }](https://github.com/apps/${ author.slice(0, -APP_AUTHOR_SUFFIX_LENGTH) })`);
            else link.push(`by @${ author }`);
          }

          if (link.length > 0) links.push(link.join(" "));
        }

        if (links.length > 0) log += ` (${ links.join(", ") })`;

        changelog.push(log);
      }
    }

    changelog.push("");

    return changelog;
  }, []).join("\n");
}
