---
title: Conventional Commits
summary: A lightweight commit-message convention that makes history readable and enables automated changelogs and semantic versioning.
difficulty: beginner
tags: [git, version-control, workflow, semver]
order: 2
related: [devops/git-essentials]
status: needs-review
reviewNotes: Expanded from the 2023 Conventional Commits note (description and link kept). Added the format, types, breaking changes and tooling.
---

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) is a specification for commit messages. It's a small amount of structure that makes history scannable for humans and parseable by tools.

## Format

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

```text
feat(search): add fuzzy matching to the command palette

Uses MiniSearch's fuzzy option so misspellings still find entries.

Closes #42
```

## Common types

| Type | Use for | SemVer impact |
| --- | --- | --- |
| `feat` | A new feature | minor |
| `fix` | A bug fix | patch |
| `docs` | Documentation only | — |
| `refactor` | Code change that neither fixes nor adds a feature | — |
| `perf` | Performance improvement | — |
| `test` | Adding or fixing tests | — |
| `build` / `ci` | Build system or CI changes | — |
| `chore` | Maintenance that doesn't touch source or tests | — |

Only `feat` and `fix` are defined by the spec; the rest are a widely used convention (from the Angular commit guidelines).

## Breaking changes

Mark them with `!` after the type/scope, or a `BREAKING CHANGE:` footer. They trigger a **major** version bump.

```text
feat(api)!: return 404 instead of 200 with an empty body for missing orders
```

## Tooling

- **commitlint** + a Git hook (Husky or lefthook) to enforce the format.
- **release-please** or **semantic-release** to bump versions and generate changelogs automatically.

```recall
Q: What's the structure of a Conventional Commit subject line?
A: `type(optional scope)!: description` — e.g. `fix(auth): handle expired refresh tokens`.

Q: Which commit types map to minor and patch releases?
A: `feat` → minor, `fix` → patch.

Q: How do you mark a breaking change?
A: Add `!` after the type/scope or include a `BREAKING CHANGE:` footer; it triggers a major version bump.
```
