import { getInput } from "@actions/core";
import { packageName } from "#inputs";

jest.unmock("#inputs");

it("should get the optional package input", () => {
  jest.mocked(getInput).mockReturnValueOnce(" web ");

  expect(packageName()).toBe("web");

  expect(getInput).toHaveBeenCalledTimes(1);
  expect(getInput).toHaveBeenCalledWith("package", { required: false });
});
