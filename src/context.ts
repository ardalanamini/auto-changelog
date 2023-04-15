import Joi from "joi";
import YAML from "yaml";
import { ActionInputsI, TypesI } from "./constants";
import { getBooleanInput, getInput } from "@actions/core";

export function getToken(): string {
  return getInput("github-token", { required: true });
}

export async function getInputs(): Promise<ActionInputsI> {
  const commitTypes = YAML.parse(getInput("commit-types", { required: true }));
  const defaultCommitType = getInput("default-commit-type", { required: true });
  const releaseName = getInput("release-name", { required: true });
  const mentionAuthors = getBooleanInput("mention-authors", { required: true });
  const mentionNewContributors = getBooleanInput("mention-new-contributors", {
    required: true,
  });
  const includeCompare = getBooleanInput("include-compare", { required: true });
  const includePRLinks = getBooleanInput("include-pr-links", { required: true });
  const includeCommitLinks = getBooleanInput("include-commit-links", { required: true });
  const semver = getBooleanInput("semver", { required: true });

  return Joi.object<ActionInputsI, true>()
    .keys({
      commitTypes: Joi.object<TypesI>()
        .pattern(Joi.string(), Joi.string())
        .required(),
      defaultCommitType     : Joi.string().required(),
      releaseName           : Joi.string().required(),
      mentionAuthors        : Joi.boolean().required(),
      mentionNewContributors: Joi.boolean().required(),
      includeCompare        : Joi.boolean().required(),
      includePRLinks        : Joi.boolean().required(),
      includeCommitLinks    : Joi.boolean().required(),
      semver                : Joi.boolean().required(),
    })
    .validateAsync({
      commitTypes,
      defaultCommitType,
      releaseName,
      mentionAuthors,
      mentionNewContributors,
      includeCompare,
      includePRLinks,
      includeCommitLinks,
      semver,
    });
}
