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

import { getBooleanInput } from "@actions/core";
import { booleanInput, cache } from "../../src/utils";

it("should get and parse a boolean input", () => {
  const inputName = "foo";
  const inputValue = true;

  jest.mocked(getBooleanInput).mockReturnValueOnce(inputValue);

  const result = booleanInput(inputName);

  expect(result).toEqual(inputValue);

  expect(getBooleanInput).toHaveBeenCalledTimes(1);
  expect(getBooleanInput).toHaveBeenCalledWith(inputName, { required: true });
});

it("should get a cached boolean input", () => {
  const inputName = "foo";
  const inputValue = true;

  cache(inputName, () => inputValue);

  const result = booleanInput(inputName);

  expect(result).toEqual(inputValue);

  expect(getBooleanInput).toHaveBeenCalledTimes(0);
});

it("should get and parse an optional boolean input", () => {
  const inputName = "foo";
  const inputValue = false;

  jest.mocked(getBooleanInput).mockReturnValueOnce(inputValue);

  const result = booleanInput(inputName, false);

  expect(result).toEqual(inputValue);

  expect(getBooleanInput).toHaveBeenCalledTimes(1);
  expect(getBooleanInput).toHaveBeenCalledWith(inputName, { required: false });
});
