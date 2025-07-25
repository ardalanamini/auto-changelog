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

import { cache, clearCache } from "#utils";

it("should cache value", () => {
  const name = "foo";
  const value = "bar";

  const mockFunction = jest.fn(() => value);

  const firstCallResult = cache(name, mockFunction);

  expect(firstCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(1);

  mockFunction.mockClear();

  const secondCallResult = cache(name, mockFunction);

  expect(secondCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(0);
});

it("should overwrite cache value", () => {
  const name = "foo";
  const value = "bar";

  const mockFunction = jest.fn(() => value);

  const firstCallResult = cache(name, mockFunction);

  expect(firstCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(1);

  mockFunction.mockClear();

  const secondCallResult = cache(name, mockFunction, true);

  expect(secondCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(1);
});

it("should clear cache", () => {
  const name = "foo";
  const value = "bar";

  const mockFunction = jest.fn(() => value);

  const firstCallResult = cache(name, mockFunction);

  expect(firstCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(1);

  mockFunction.mockClear();

  clearCache();

  const secondCallResult = cache(name, mockFunction);

  expect(secondCallResult).toBe(value);

  expect(mockFunction).toHaveBeenCalledTimes(1);
});
