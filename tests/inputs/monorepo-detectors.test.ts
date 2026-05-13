import { getInput } from "@actions/core";
import { monorepoDetectors } from "#inputs";

jest.unmock("#inputs");

it("should parse monorepo detectors", () => {
  jest.mocked(getInput).mockReturnValueOnce("pnpm, nx");

  expect(monorepoDetectors()).toEqual(["pnpm", "nx"]);

  expect(getInput).toHaveBeenCalledWith("monorepo-detectors", { required: false });
});

it("should default monorepo detectors to auto", () => {
  jest.mocked(getInput).mockReturnValueOnce("");

  expect(monorepoDetectors()).toEqual(["auto"]);
});

it("should reject unsupported monorepo detectors", () => {
  jest.mocked(getInput).mockReturnValueOnce("pnpm,unknown");

  expect(() => monorepoDetectors()).toThrow("Unexpected monorepo-detectors input");
});
