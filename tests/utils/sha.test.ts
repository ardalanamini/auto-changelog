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

import { context } from "@actions/github";
import { sha } from "#utils";

it("should get the current commit sha", () => {
  const shaValue = "3c1177539c1a216084f922ea52e56dd719a25945";

  const original = jest.mocked(context).sha;

  jest.mocked(context).sha = shaValue;

  const result = sha();

  jest.mocked(context).sha = original;

  expect(result).toBe(shaValue);
});

it("should cache the sha value", () => {
  const shaValue: string = "3c1177539c1a216084f922ea52e56dd719a25945";
  const original = jest.mocked(context).sha;

  jest.mocked(context).sha = shaValue;

  // The first call should access context.sha
  const result1 = sha();

  // Change the mocked value
  jest.mocked(context).sha = "different-sha";

  // Second call should return cached value, not the new mocked value
  const result2 = sha();

  jest.mocked(context).sha = original;

  expect(result1).toBe(shaValue);

  // Should be cached
  expect(result2).toBe(shaValue);
});
