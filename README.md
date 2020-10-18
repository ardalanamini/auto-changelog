# Auto Changelog

Automatic Changelog generator

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

The `type` must be one of the followings:

* `breaking`
* `build`
* `ci`
* `chore`
* `docs`
* `feat`
* `fix`
* `other`
* `perf`
* `refactor`
* `revert`
* `style`
* `test`

> If the `type` is not found in the list, it'll be considered as `other`.

The `category` is optional and can be anything of your choice.

The `flag` is optional (if provided, it must be surrounded in square brackets). (eg. `breaking`)

### Inputs

#### `token`

**Required** Github token.

#### `exclude`

Exclude selected commit types (comma separated).

#### `file`

Specify a change log file to create or update with the latest log. Omit to not write to any file. This file will be committed to the repository.

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: ardalanamini/auto-changelog@v1.0.0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  exclude: 'perf,other,breaking'
  file: './CHANGELOG.md'
```
