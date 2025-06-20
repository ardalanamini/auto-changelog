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

import { trim } from "#utils";

it("should remove leading and trailing whitespace", () => {
  expect(trim("  hello  ")).toBe("hello");
});

it("should replace multiple spaces with a single space", () => {
  expect(trim("hello   world")).toBe("hello world");
});

it("should handle null value", () => {
  expect(trim(null)).toBeNull();
});

it("should handle undefined value", () => {
  // eslint-disable-next-line no-undefined,@typescript-eslint/no-confusing-void-expression,unicorn/no-useless-undefined
  expect(trim(undefined)).toBeUndefined();
});

it("should handle empty string", () => {
  expect(trim("")).toBe("");
});

it("should handle string with no extra spaces", () => {
  expect(trim("hello")).toBe("hello");
});

it("should handle strings with only spaces", () => {
  expect(trim("     ")).toBe("");
});
