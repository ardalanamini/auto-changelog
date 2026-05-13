/**
 * MIT License
 *
 * Copyright (c) 2026 Ardalan Amini
 */

import { type SemVer, parse } from "semver";

export function getPackageTagPrefix(packageName: string): string {
  return `${ packageName }@`;
}

export function parsePackageTagVersion(tagName: string, packageName: string): string | null {
  const prefix = getPackageTagPrefix(packageName);

  if (!tagName.startsWith(prefix)) return null;

  return tagName.slice(prefix.length);
}

export function parsePackageTagSemanticVersion(tagName: string, packageName: string): SemVer | null {
  const version = parsePackageTagVersion(tagName, packageName);

  if (!version) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return parse(version, { includePrerelease: true } as never);
}
