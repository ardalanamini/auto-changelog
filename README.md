# Auto Changelog

[![Test](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml/badge.svg)](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml)

Automatic Changelog generator

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

* The `type` must be one of `commit-types` input keys. In the changelog output, the value will be used.

  > The changelogs will be in the same order as `commit-types` input.

  > If the `type` doesn't match any of the provided `commit-types` input keys, The `default-commit-type` input will be used instead.

* The `category` is optional and can be anything of your choice.

* The `flag` is optional (if provided, it must be surrounded in square brackets) and can be one of the followings:

  * `ignore` (Omits the commit from the changelog)

  > If `flag` is not found in the list, it'll be ignored.

### Inputs

#### `token` **(Optional)**

Github token.

_Default:_

```yaml
${{ github.token }}
```

#### `commit-types` **(Optional)**

Commit type.

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

#### `default-commit-type` **(Optional)**

Default commit type.

This input will be used when the commit message matches none of the defined `commit-types` input.

_Default:_

```yaml
Other Changes
```

### Outputs

#### `changelog`

The generated changelog.

### Example usage

Using default inputs:

```yaml
uses: ardalanamini/auto-changelog@v1
```

Using custom inputs:

```yaml
uses: ardalanamini/auto-changelog@v1
with:
  token: ${{ github.token }}
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
```
