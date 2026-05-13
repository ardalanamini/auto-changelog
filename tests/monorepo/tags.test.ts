import { getPackageTagPrefix, parsePackageTagSemanticVersion, parsePackageTagVersion } from "#monorepo";

it("should build package tag prefixes", () => {
  expect(getPackageTagPrefix("web")).toBe("web@");
  expect(getPackageTagPrefix("@scope/ui")).toBe("@scope/ui@");
});

it("should parse package tag versions", () => {
  expect(parsePackageTagVersion("web@1.2.3", "web")).toBe("1.2.3");
  expect(parsePackageTagVersion("@scope/ui@1.2.3", "@scope/ui")).toBe("1.2.3");
  expect(parsePackageTagVersion("api@1.2.3", "web")).toBeNull();
});

it("should parse package tag semantic versions", () => {
  const version = parsePackageTagSemanticVersion("@scope/ui@1.2.3-beta.1", "@scope/ui");

  expect(version?.version).toBe("1.2.3-beta.1");
  expect(version?.prerelease).toEqual(["beta", 1]);
});
