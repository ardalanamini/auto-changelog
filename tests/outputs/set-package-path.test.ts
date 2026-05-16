import { info, setOutput } from "@actions/core";
import { expect, it } from "@jest/globals";
import { setPackagePath } from "#outputs";

it("should log and set the package-path output", () => {
  setPackagePath("apps/web");

  expect(info).toHaveBeenCalledTimes(1);
  expect(info).toHaveBeenCalledWith("output -> package-path: apps/web");

  expect(setOutput).toHaveBeenCalledTimes(1);
  expect(setOutput).toHaveBeenCalledWith("package-path", "apps/web");
});
