import { getInput } from "@actions/core";
import Joi from "joi";
import YAML from "yaml";
import { ActionInputsI, TypesI } from "./constants";

export function getToken(): string {
  return getInput("github-token", { required: true });
}

export async function getInputs(): Promise<ActionInputsI> {
  const commitTypes = YAML.parse(getInput("commit-types", { required: true }));
  const defaultCommitType = getInput("default-commit-type", { required: true });

  return Joi.object<ActionInputsI, true>()
    .keys({
      commitTypes: Joi.object<TypesI>()
        .pattern(Joi.string(), Joi.string())
        .required(),
      defaultCommitType: Joi.string().required(),
    })
    .validateAsync({ commitTypes, defaultCommitType });
}
