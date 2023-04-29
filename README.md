# Auto Changelog

[![Test](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml/badge.svg)](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml)

Automatic Changelog generator

## Table of Content

- [Usage](#usage)
- [Inputs](#inputs)
  - [Github Token](#github-token)
  - [Commit Types](#commit-types)
  - [Default Commit Type](#default-commit-type)
  - [Release Name](#release-name)
  - [Mention Authors](#mention-authors)
  - [Mention New Contributors](#mention-new-contributors)
  - [Include GitHub Compare Link](#include-compare-link)
  - [SemVer Compatibility](#semver)
  - [Use GitHub Autolink](#use-github-autolink)
- [Outputs](#outputs)
  - [Changelog](#changelog)
  - [Pre-release](#prerelease)
  - [Release ID](#release-id)
- [Example Usage](#example-usage)

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

- The `type` must be one of `commit-types` input keys. In the changelog output, the value will be used.

  > The changelogs will be in the same order as `commit-types` input.

  > If the `type` doesn't match any of the provided `commit-types` input keys, The `default-commit-type` input will be used instead.

- The `category` is optional and can be anything of your choice.

- The `flag` is optional (if provided, it must be surrounded in square brackets) and can be one of the followings:

  - `ignore` (Omits the commit from the changelog)

  > If `flag` is not found in the list, it'll be ignored.

> Commit messages not matching the format mentioned above will be ignored in the `changelog` output.

### Inputs

#### `github-token`

**(Optional)**

Github token.

_Default:_

```yaml
${{ github.token }}
```

#### `commit-types`

**(Optional)**

Commit types.

_Default:_

```yaml
breaking: Breaking Changes
feat: New Features
fix: Bug Fixes
revert: Reverts
perf: Performance Improvements
refactor: Refactors
deps: Dependencies
docs: Documentation Changes
style: Code Style Changes
build: Build System
ci: Continuous Integration
test: Tests
chore: Chores
other: Other Changes
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

Enable semver based version comparison.

If enabled it'll determine whether the github ref is a valid semver string,
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

> if semver is set to `true`, otherwise this output will always return `false`.

#### `release-id`

The pre-release id in case of prerelease being `true`, `latest` otherwise. (e.g. `alpha`, `beta`, `rc`, `canary`)

> if semver is set to `true`, otherwise this output will always return `latest`.

### Example Usage

Using with default inputs:

```yaml
- name: Changelog
  uses: ardalanamini/auto-changelog@v4
  id: changelog
```

Using with custom inputs:

```yaml
- name: Changelog
  uses: ardalanamini/auto-changelog@v4
  id: changelog
  with:
    github-token: ${{ github.token }}
    commit-types: |
      breaking: Breaking Changes
      feat: New Features
      fix: Bug Fixes
      revert: Reverts
      perf: Performance Improvements
      refactor: Refactors
      deps: Dependencies
      docs: Documentation Changes
      style: Code Style Changes
      build: Build System
      ci: Continuous Integration
      test: Tests
      chore: Chores
      other: Other Changes
    default-commit-type: Other Changes
    release-name: v1.0.0
    mention-authors: true
    mention-new-contributors: true
    include-compare-link: true
    include-pr-lints: true
    include-commit-lints: true
    semver: true
    use-github-autolink: true
```
