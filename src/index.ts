/*
 * MIT License
 *
 * Copyright (c) 2020-2025 Ardalan Amini
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

import { setFailed } from "@actions/core";
import { generateChangelog } from "./changelog.js";
import { generateFooter } from "./footer.js";
import { setChangelog, setPrerelease, setReleaseId } from "./outputs/index.js";
import { getTagInfo } from "./tag.js";

async function run(): Promise<void> {
  const { prerelease, releaseId, previous } = await getTagInfo();

  setPrerelease(prerelease);

  setReleaseId(releaseId);

  let changelog = await generateChangelog(previous?.sha);

  changelog += await generateFooter(previous?.name);

  setChangelog(changelog);
}

run().catch(setFailed);
