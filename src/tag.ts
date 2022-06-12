import SemVer from "semver";
import { TagInputI, TagResultI } from "./constants.js";

export async function getTagSha(input: TagInputI): Promise<TagResultI> {
  const { octokit, owner, repo, sha, semver, prerelease } = input;

  for await (const { data } of octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      per_page: 100,
      owner,
      repo,
    },
  )) {
    for (const {
      name,
      commit: { sha: tagSha },
    } of data) {
      if (sha === tagSha) continue;

      if (semver == null) {
        return {
          sha: tagSha,
          name,
        };
      }

      const tagSemver = SemVer.parse(name, { includePrerelease: true });

      if (tagSemver == null || semver.compare(tagSemver) <= 0) continue;

      if (tagSemver.prerelease.length > 0 && !prerelease) continue;

      return {
        sha: tagSha,
        name,
      };
    }
  }

  return {};
}
