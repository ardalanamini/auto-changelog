/**
 * MIT License
 *
 * Copyright (c) 2026 Ardalan Amini
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { input } from "#utils/input";
import { trim } from "#utils/trim";

const INCLUDE_ROOT_COMMITS = ["false", "auto", "all"] as const;

type IncludeRootCommits = typeof INCLUDE_ROOT_COMMITS[number];

const ACCEPTED_INCLUDE_ROOT_COMMITS = new Set<string>(INCLUDE_ROOT_COMMITS);

function includeRootCommits(): IncludeRootCommits {
  return input("include-root-commits", (value) => {
    const normalized = trim(value) || "false";

    if (!ACCEPTED_INCLUDE_ROOT_COMMITS.has(normalized)) {
      const expected = INCLUDE_ROOT_COMMITS.join(", ");

      throw new TypeError(`Unexpected include-root-commits input: "${ normalized }" (expected one of ${ expected })`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return normalized as IncludeRootCommits;
  }, false);
}

export { INCLUDE_ROOT_COMMITS, includeRootCommits };
export type { IncludeRootCommits };
