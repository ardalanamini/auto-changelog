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

import { releaseName, releaseNamePrefix } from "#inputs";
import { parseSemanticVersion } from "#utils";

it("should parse the useSemver version string", () => {
  const major = 1;
  const minor = 2;
  const patch = 3;
  const prerelease = "alpha";
  const prereleaseVersion = 4;
  const version = `${ major }.${ minor }.${ patch }-${ prerelease }.${ prereleaseVersion }`;
  const raw = `v${ version }`;
  const releaseNamePrefixValue = "@actions/github/";

  jest.mocked(releaseNamePrefix).mockReturnValueOnce(releaseNamePrefixValue);

  const result = parseSemanticVersion(raw);

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

  expect(releaseNamePrefix).toHaveBeenCalledTimes(1);
});

it("should parse the release name by default", () => {
  const major = 1;
  const minor = 2;
  const patch = 3;
  const prerelease = "alpha";
  const prereleaseVersion = 4;
  const version = `${ major }.${ minor }.${ patch }-${ prerelease }.${ prereleaseVersion }`;
  const raw = `v${ version }`;
  const releaseNamePrefixValue = "@actions/github/";

  jest.mocked(releaseName).mockReturnValueOnce(raw);
  jest.mocked(releaseNamePrefix).mockReturnValueOnce(releaseNamePrefixValue);

  const result = parseSemanticVersion();

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

  expect(releaseName).toHaveBeenCalledTimes(1);
  expect(releaseNamePrefix).toHaveBeenCalledTimes(1);
});
