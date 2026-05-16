import { info, setOutput } from "@actions/core";
import { expect, it } from "@jest/globals";
import { setPackageName } from "#outputs";

it("should log and set the package-name output", () => {
  setPackageName("web");

  expect(info).toHaveBeenCalledTimes(1);
  expect(info).toHaveBeenCalledWith("output -> package-name: web");

  expect(setOutput).toHaveBeenCalledTimes(1);
  expect(setOutput).toHaveBeenCalledWith("package-name", "web");
});
