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

The `flag` is optional (if provided, it must be surrounded in square brackets). (eg. `breaking`)

### Inputs

#### `token`

**Required** Github token.

#### `exclude`

Exclude selected commit types (comma separated).

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: ardalanamini/auto-changelog@v1.0.1
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  exclude: 'perf,other,breaking'
```
