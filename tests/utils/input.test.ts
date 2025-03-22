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
import { cache, input } from "../../src/utils";

it("should get input value", () => {
  const name = "foo";
  const value = "bar";

  jest.mocked(getInput).mockReturnValueOnce(value);

  const result = input(name);

  expect(result).toBe(value);

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(name, { required: true });
});

it("should get cached input value", () => {
  const name = "foo";
  const value = "bar";

  cache(name, () => value);

  const result = input(name);

  expect(result).toBe(value);

  expect(getInput).toHaveBeenCalledTimes(0);
});

it("should get optional input value", () => {
  const name = "foo";
  const value = "";

  jest.mocked(getInput).mockReturnValueOnce(value);

  const result = input(name, false);

  expect(result).toBe(value);

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(name, { required: false });
});

it("should get parsed input value", () => {
  const name = "foo";

  jest.mocked(getInput).mockReturnValueOnce("1");

  const result = input(name, inputValue => +inputValue);

  expect(result).toBe(1);

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(name, { required: true });
});

it("should get parsed optional input value", () => {
  const name = "foo";

  jest.mocked(getInput).mockReturnValueOnce("");

  const result = input(name, inputValue => +(inputValue || "1"), false);

  expect(result).toBe(1);

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith(name, { required: false });
});
