/*
 * MIT License
 *
 * Copyright (c) 2020-2023 Ardalan Amini
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { getBooleanInput, getInput } from "@actions/core";
import Joi from "joi";
import YAML from "yaml";
import { type ActionInputsI, type TypesI } from "./constants";

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
