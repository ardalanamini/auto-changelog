# Auto Changelog

[![Tests](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml/badge.svg)](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml)
[![Code Coverage](https://codecov.io/gh/ardalanamini/auto-changelog/graph/badge.svg?token=24AMJ5Z480)](https://codecov.io/gh/ardalanamini/auto-changelog)

Automatic Changelog generator

## Table of Content

- [Usage](#usage)
- [Inputs](#inputs)
  - [Preferred API](#preferred-api)
  - [Github Token](#github-token)
  - [Commit Types](#commit-types)
  - [Default Commit Type](#default-commit-type)
  - [Release Name](#release-name)
  - [Package](#package)
  - [Monorepo Detectors](#monorepo-detectors)
  - [Include Root Commits](#include-root-commits)
  - [Release Name Prefix](#release-name-prefix)
  - [Mention Authors](#mention-authors)
  - [Mention New Contributors](#mention-new-contributors)
  - [Include GitHub Compare Link](#include-compare-link)
  - [SemVer Compatibility](#semver)
  - [Use GitHub Autolink](#use-github-autolink)
- [Outputs](#outputs)
  - [Changelog](#changelog)
  - [Pre-release](#prerelease)
  - [Release ID](#release-id)
  - [Package Name](#package-name)
  - [Package Path](#package-path)
- [Example Usage](#example-usage)

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

- The `type` must be one of `commit-types` input keys. In the changelog output, the value will be used.

  > The changelogs will be in the same order as `commit-types` input.

  > If the `type` doesn't match any of the provided `commit-types` input keys, The `default-commit-type` input will be
  used instead.

- The `category` is optional and can be anything of your choice.

- The `flag` is optional (if provided, it must be surrounded in square brackets) and can be one of the followings:

  - `ignore` (Omits the commit from the changelog)

  > If `flag` is not found in the list, it'll be ignored.

> Commit messages not matching the format mentioned above will be ignored in the `changelog` output.

### Inputs

#### `preferred-api`

**(Optional)**

The preferred API to acquire the required information to generate the changelog.

Possible options:

- `Git`
- `GitHub`

Notes:

- **`Git`**: Uses the local `git` CLI to read commits and tags from the checked-out repository. This is optimized for large repositories by **streaming commits and tags** (it does not load full histories into memory). It can optionally use GitHub (if a token is available) to resolve GitHub usernames from author emails.
- **`GitHub`**: Uses GitHub APIs for commits/tags and for generating GitHub-style release notes sections (e.g. New Contributors).

_Default:_

```yaml
GitHub
```

#### `github-token`

**(Optional)**

Github token.

Notes:

- Required when using **`preferred-api: GitHub`**.
- When using **`preferred-api: Git`**, a token is only needed for optional enrichment (e.g. trying to resolve GitHub usernames from author emails). If omitted, Git mode will fall back to non-`@username` formatting where necessary.

_Default:_

```yaml
${{ github.token }}
```

#### `commit-types`

**(Optional)**

Commit types.

> The default value is based on the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0)

_Default:_

```yaml
feat    : New Features
fix     : Bug Fixes
build   : Build System & Dependencies
perf    : Performance Improvements
docs    : Documentation
test    : Tests
refactor: Refactors
chore   : Chores
ci      : CI
style   : Code Style
revert  : Reverts
```

#### `default-commit-type`

**(Optional)**

Default commit type.

This input will be used when the commit message matches none of the defined `commit-types` input.

_Default:_

```yaml
Other Changes
```

#### `release-name`

**(Optional)**

Release name (version, e.g. `v1.0.0`).

_Default:_

```yaml
${{ github.ref_name }}
```

#### `package`

**(Optional)**

Monorepo package/app name to generate the changelog for.

When this input is empty, the action keeps the current repository-wide behavior and does not run monorepo detection.

When this input is set, the action detects workspace packages, selects the matching package by name, and expects package release tags in this format:

```txt
{name}@{version}
```

Examples:

```txt
web@1.2.3
api@2.0.0
@scope/ui@0.4.1
```

_Default:_

```yaml
""
```

#### `monorepo-detectors`

**(Optional)**

Monorepo detection strategies used when `package` is set.

Possible options:

- `auto`
- `pnpm`
- `npm`
- `yarn`
- `lerna`
- `nx`

Use comma-separated values to limit detection:

```yaml
pnpm,nx
```

`auto` tries `pnpm`, `npm`/`yarn` workspaces, `lerna`, then `nx`.

_Default:_

```yaml
auto
```

#### `include-root-commits`

**(Optional)**

Controls root/shared commits in monorepo package changelogs. This input is ignored when `package` is empty.

Possible options:

- `false`: only include commits touching the selected package path.
- `auto`: include selected package commits and related root workspace/config files.
- `all`: include selected package commits and any root/shared files, but still exclude commits that only touch sibling packages.

_Default:_

```yaml
false
```

#### `release-name-prefix`

**(Optional)**

Release name (version) prefix.

> Example: For a release name such as `@actions/github/v1.0.0` it would be `@actions/github/`

_Default:_

```yaml
""
```

#### `mention-authors`

**(Optional)**

Mention the author of each commit.

_Default:_

```yaml
true
```

#### `mention-new-contributors`

**(Optional)**

Mention new contributors at the bottom of the changelog (New Contributors).

_Default:_

```yaml
true
```

#### `include-compare-link`

**(Optional)**

Include GitHub compare at the bottom of the changelog (Full Changelog).

> If there is no previous tag determined it'll be ommited regardless of the provided value.

_Default:_

```yaml
true
```

#### `include-pr-links`

**(Optional)**

Include GitHub pull request links at each log if applicable.

_Default:_

```yaml
true
```

#### `include-commit-links`

**(Optional)**

Include GitHub commit links at each log.

_Default:_

```yaml
true
```

#### `semver`

**(Optional)**

Enable Semver-based version comparison.

If enabled it'll determine whether the GitHub ref is a valid `semver` string,
it'll fail the action in case it's not.

It'll then determine whether the version is a pre-release or not,
if it is, the previous version will be selected from any version (pre-release or not) lesser than the current ref,
if current ref is not a pre-release,
the previous version will be selected only from the latest version (not pre-release) lesser than the current ref.

_Default:_

```yaml
true
```

#### `use-github-autolink`

**(Optional)**

Use [GitHub Autolink](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls).

_Default:_

```yaml
true
```

### Outputs

#### `changelog`

The generated changelog.

#### `prerelease`

Indicates whether it's a pre-release or not.

> if `semver` is set to `true`, otherwise this output will always return `false`.

#### `release-id`

The pre-release id in case of pre-release being `true`, `latest` otherwise. (e.g. `alpha`, `beta`, `rc`, `canary`)

> if `semver` is set to `true`, otherwise this output will always return `latest`.

#### `package-name`

The selected monorepo package name when `package` mode is enabled, otherwise an empty string.

#### `package-path`

The selected monorepo package path when `package` mode is enabled, otherwise an empty string.

### Example Usage

Using with default inputs:

```yaml
- name: Changelog
  uses: ardalanamini/auto-changelog@v4
  id  : changelog
```

Using with custom inputs:

```yaml
- uses: ardalanamini/auto-changelog@v4
  id  : changelog
  name: Changelog
  with:
    github-token            : ${{ github.token }}
    preferred-api           : GitHub
    commit-types            : |
      feat    : New Features
      fix     : Bug Fixes
      build   : Build System & Dependencies
      perf    : Performance Improvements
      docs    : Documentation
      test    : Tests
      refactor: Refactors
      chore   : Chores
      ci      : CI
      style   : Code Style
      revert  : Reverts
    default-commit-type     : Other Changes
    release-name            : v1.0.0
    package                 : ""
    monorepo-detectors      : auto
    include-root-commits    : false
    release-name-prefix     : ""
    mention-authors         : true
    mention-new-contributors: true
    include-compare-link    : true
    include-pr-links        : true
    include-commit-links    : true
    semver                  : true
    use-github-autolink     : true
```

Using with a monorepo package release:

```yaml
- uses: ardalanamini/auto-changelog@v4
  id  : changelog
  name: Changelog
  with:
    package             : web
    release-name        : web@1.2.3
    monorepo-detectors  : pnpm,nx
    include-root-commits: auto
```
