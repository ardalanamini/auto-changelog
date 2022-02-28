# Auto Changelog

[![Test](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml/badge.svg)](https://github.com/ardalanamini/auto-changelog/actions/workflows/test.yml)

Automatic Changelog generator

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

The `type` must be one of the followings:

* `breaking` (Breaking Changes)
* `feat` (New Features)
* `fix` (Bug Fixes)
* `revert` (Reverts)
* `perf` (Performance Improvements)
* `refactor` (Refactors)
* `deps` (Dependencies)
* `docs` (Documentation Changes)
* `style` (Code Style Changes)
* `build` (Build System)
* `ci` (Continuous Integration)
* `test` (Tests)
* `chore` (Chores)
* `other` (Other Changes)

> The changelogs will be in the same order as listed above.

> If the `type` is not found in the list, it'll be considered as `other`.

The `category` is optional and can be anything of your choice.

The `flag` is optional (if provided, it must be surrounded in square brackets) and can be one of the followings:

* `ignore` (Omits the commit from the changelog)

> If `flag` is not found in the list, it'll be ignored.

### Inputs

#### `token` **(Required)**

Github token.

_Default:_ `${{ github.token }}`

#### `exclude` **(Optional)**

Exclude selected commit types (comma separated).

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: ardalanamini/auto-changelog@v1
with:
  exclude: 'perf,other,breaking'
```
