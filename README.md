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

#### `generate`

Generate or update a change log file.

#### `path`

If `generate` set, specifies the path of the change log file to update (default `./CHANGELOG.md`)

#### `title`

If `generate` set, specifies the markdown text to use as the file heading (default `# Changelog`)

#### `section`

If `generate` set, specifies the tagged markdown text to use for each release section (default `## Release {{ GITHUB_REF }}`)

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: ardalanamini/auto-changelog@v1.0.0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  exclude: 'perf,other,breaking'
  generate: 'true'
  path: './CHANGELOG.md'
  title: '# My Project Change Log'
  section: '## Release: {{ GITHUB_REF }}'
```
