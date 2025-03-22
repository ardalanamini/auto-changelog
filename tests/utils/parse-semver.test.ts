/**
 * MIT License
 *
 * Copyright (c) 2025 Ardalan Amini
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
 */

import { getInput } from "@actions/core";
import { parseSemVer } from "../../src/utils";

it("should parse the semver version string", () => {
  const major = 1;
  const minor = 2;
  const patch = 3;
  const prerelease = "alpha";
  const prereleaseVersion = 4;
  const version = `${ major }.${ minor }.${ patch }-${ prerelease }.${ prereleaseVersion }`;
  const raw = `v${ version }`;
  const releaseNamePrefix = "@actions/github/";

  jest.mocked(getInput).mockImplementationOnce((name) => {
    if (name === "release-name-prefix") return releaseNamePrefix;

    return "";
  });

  const result = parseSemVer(raw);

  expect(result).toBeDefined();
  expect(result).toEqual({
    build            : [],
    includePrerelease: true,
    loose            : false,
    major,
    minor,
    options          : { includePrerelease: true },
    patch,
    prerelease       : [prerelease, prereleaseVersion],
    raw,
    version,
  });

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith("release-name-prefix", { required: false });
});

it("should parse the release name by default", () => {
  const major = 1;
  const minor = 2;
  const patch = 3;
  const prerelease = "alpha";
  const prereleaseVersion = 4;
  const version = `${ major }.${ minor }.${ patch }-${ prerelease }.${ prereleaseVersion }`;
  const raw = `v${ version }`;
  const releaseNamePrefix = "@actions/github/";

  jest.mocked(getInput).mockImplementation((name) => {
    switch (name) {
      case "release-name":
        return raw;
      case "release-name-prefix":
        return releaseNamePrefix;
      default:
        return "";
    }
  });

  const result = parseSemVer();

  expect(result).toBeDefined();
  expect(result).toEqual({
    build            : [],
    includePrerelease: true,
    loose            : false,
    major,
    minor,
    options          : { includePrerelease: true },
    patch,
    prerelease       : [prerelease, prereleaseVersion],
    raw,
    version,
  });

  expect(getInput).toHaveBeenCalledTimes(2);
  expect(getInput).toHaveBeenNthCalledWith(1, "release-name", { required: true });
  expect(getInput).toHaveBeenNthCalledWith(2, "release-name-prefix", { required: false });
});
