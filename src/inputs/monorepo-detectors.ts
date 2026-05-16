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

const MONOREPO_DETECTORS = ["auto", "pnpm", "npm", "yarn", "lerna", "nx"] as const;

type MonorepoDetector = typeof MONOREPO_DETECTORS[number];

const ACCEPTED_MONOREPO_DETECTORS = new Set<string>(MONOREPO_DETECTORS);

function monorepoDetectors(): MonorepoDetector[] {
  return input("monorepo-detectors", (value) => {
    const detectors = value
      .split(",")
      .map(v => trim(v))
      .filter(Boolean);

    const result = detectors.length > 0 ? detectors : ["auto"];

    for (const detector of result) {
      if (!ACCEPTED_MONOREPO_DETECTORS.has(detector)) {
        const expected = MONOREPO_DETECTORS.join(", ");

        throw new TypeError(`Unexpected monorepo-detectors input: "${ detector }" (expected one of ${ expected })`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return result as MonorepoDetector[];
  }, false);
}

export { MONOREPO_DETECTORS, monorepoDetectors };
export type { MonorepoDetector };
