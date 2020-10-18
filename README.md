# Auto Changelog

Automatic Changelog generator

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

The `type` must be one of the followings:

* `breaking` (Breaking Changes)
* `build` (Build System / Dependencies)
* `ci` (Continuous Integration)
* `chore` (Chores)
* `docs` (Documentation Changes)
* `feat` (New Features)
* `fix` (Bug Fixes)
* `other` (Other Changes)
* `perf` (Performance Improvements)
* `refactor` (Refactors)
* `revert` (Reverts)
* `style` (Code Style Changes)
* `test` (Tests)

> If the `type` is not found in the list, it'll be considered as `other`.

The `category` is optional and can be anything of your choice.

The `flag` is optional (if provided, it must be surrounded in square brackets) and can be one of the followings:

* `ignore` (Omits the commit from the changelog)

> If `flag` is not found in the list, it'll be ignored.

### Inputs

#### `token` **(Required)**

Github token.

#### `exclude` **(Optional)**

Exclude selected commit types (comma separated).

#### `file`

Specify a change log file to create or update with the latest log. Omit to not write to any file. This file will be committed to the repository.

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: ardalanamini/auto-changelog@v1.1.0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  exclude: 'perf,other,breaking'
  file: './CHANGELOG.md'
```
