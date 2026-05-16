import { getInput } from "@actions/core";
import { includeRootCommits } from "#inputs";

jest.unmock("#inputs");

it.each(["false", "auto", "all"] as const)("should parse include-root-commits as %s", (value) => {
  jest.mocked(getInput).mockReturnValueOnce(value);

  expect(includeRootCommits()).toBe(value);

  expect(getInput).toHaveBeenCalledWith("include-root-commits", { required: false });
});

it("should default include-root-commits to false", () => {
  jest.mocked(getInput).mockReturnValueOnce("");

  expect(includeRootCommits()).toBe("false");
});

it("should reject unsupported include-root-commits values", () => {
  jest.mocked(getInput).mockReturnValueOnce("true");

  expect(() => includeRootCommits()).toThrow("Unexpected include-root-commits input");
});
