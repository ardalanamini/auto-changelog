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

#### `files_to_commit`

Commits any files, like the updated changelog file, to the repo on completion (comma separated). Does not commit anything by default.

#### `commit_message`

If `files_to_commit` contains any files to commit, this specifies the message to use (default `chore(pipeline updates): [skip ci]`)

#### `author_name`

If `files_to_commit` contains any files to commit, this specifies the Author Name to assign to the commit (required if files are being committed)

#### `author_email`

If `files_to_commit` contains any files to commit, this specifies the Author Email to assign to the commit (required if files are being committed)

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
  section: '## Release'
  files_to_commit: './CHANGELOG.md'
  commit_message: 'chore(pipeline updates): [skip ci]'
  author_name: 'My Name'
  author_email: 'my@email.com'
```
