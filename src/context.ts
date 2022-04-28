import { getInput, getBooleanInput } from "@actions/core";
import Joi from "joi";
import YAML from "yaml";
import { ActionInputsI, TypesI } from "./constants";

export function getToken(): string {
  return getInput("github-token", { required: true });
}

export async function getInputs(): Promise<ActionInputsI> {
  const commitTypes = YAML.parse(getInput("commit-types", { required: true }));
  const defaultCommitType = getInput("default-commit-type", { required: true });
  const releaseName = getInput("release-name", { required: true });
  const semver = getBooleanInput("semver", { required: true });

  return Joi.object<ActionInputsI, true>()
    .keys({
      commitTypes: Joi.object<TypesI>()
        .pattern(Joi.string(), Joi.string())
        .required(),
      defaultCommitType: Joi.string().required(),
      releaseName: Joi.string().required(),
      semver: Joi.boolean().required(),
    })
    .validateAsync({ commitTypes, defaultCommitType, releaseName, semver });
}
