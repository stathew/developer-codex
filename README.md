# Developer Codex

An encyclopedia-style knowledge base for full-stack developers, built to help you **learn and retain** programming fundamentals in the age of AI-assisted development.

- **Markdown-first content.** Entries are plain `.md` files with front matter, so they're easy to write, review and version.
- **Interactive entries.** Standalone `.html` pages (simulations, visualizers) run in a sandboxed frame and follow the app theme.
- **Global search.** Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> or <kbd>/</kbd> anywhere. Fuzzy, prefix-matching full-text search over every section of every entry, with deep links to headings.
- **Built-in retention.** `recall` blocks render as self-test cards and feed a Leitner spaced-repetition deck (`/review`).
- **Interview prep.** Pick technology stacks and run practice or timed mock interviews drawn from the recall cards, with per-stack scores, history, and missed questions fed back into review.
- **Progress tracking.** Studied entries, bookmarks, history and category coverage, stored locally with JSON export/import.

Built with Angular 22 (standalone components, signals, zoneless), `marked`, `highlight.js` and `minisearch`.

## Getting started

Requires Node `^22.22.3 || ^24.15.0 || >=26`.

```bash
npm install
npm start          # indexes content, watches for content changes, runs ng serve on http://localhost:4200
npm run build      # indexes content and builds to dist/developer-codex
npm test           # content indexer tests (node:test) + app unit tests (Vitest)
```

The content indexer also **checks every link and image** in Markdown entries (target entry, `#heading`, category, app route and file) plus `related` front matter. A broken link fails `npm run content` and `npm run build`, so it also stops a GitHub Pages deploy. In `npm start` (watch mode) it's reported in the terminal instead.

## Tests

| Command | What it runs |
| --- | --- |
| `npm run test:content` | `scripts/*.test.mjs`: front matter, recall parsing, section/anchor extraction, link resolution and validation |
| `npm run test:app` | `src/**/*.spec.ts`: text helpers, Markdown rendering, search, and the spaced-repetition scheduler |
| `npm test` | Both |

`scripts/fixtures/slug-cases.json` is shared by both suites, so the indexer and the app can't disagree about heading anchors (which search results link to).

## Deployment

Every push to `master` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy-pages.yml`:

**https://stathew.github.io/developer-codex/**

The workflow builds with `--base-href /developer-codex/` and copies `index.html` to `404.html` so deep links work without server-side routing. You can also run it manually from the repo's **Actions** tab.

## Project structure

```text
public/content/                 ← all codex content (see the in-app "Writing Codex Entries" guide)
  categories.json               ← category titles, icons, descriptions, order
  interview-stacks.json         ← interview prep stacks (which tags/categories/entries each stack draws from)
  _shared/                      ← CSS/JS helpers for interactive HTML entries
  <category>/<entry>.md|.html
scripts/
  build-content.mjs             ← generates manifest.json + search-index.json from content
  dev.mjs                       ← runs the content watcher alongside ng serve
src/app/
  core/                         ← content, markdown, search, user-data (SRS), theme services
  layout/                       ← sidebar, search palette
  pages/                        ← home, article, category, search (explore), review, library
  shared/                       ← icon, article list
```

`manifest.json` and `search-index.json` are generated — don't edit them by hand (they're git-ignored).

## Writing content

Create `public/content/<category>/<slug>.md`:

````markdown
---
title: Database Indexes
summary: One or two sentences shown in lists and search results.
difficulty: intermediate        # beginner | intermediate | advanced
tags: [sql, performance]
related: [fundamentals/big-o-notation]
---

Body in GitHub-flavoured Markdown. Link entries by relative path: [Big-O](../fundamentals/big-o-notation.md).

> [!AI]
> Callouts: NOTE, TIP, IMPORTANT, WARNING, CAUTION, AI, RECALL.

```recall
Q: A self-test question?
A: Its answer (Markdown allowed).
```
````

The full authoring guide lives in the app at **About the Codex → Writing Codex Entries**.

## Notes

- Content is treated as trusted (it's authored in this repo), so rendered Markdown HTML bypasses Angular's sanitizer to keep code highlighting and copy buttons intact. Don't load untrusted Markdown through it.
- Learning progress lives in the browser's `localStorage`; use **My library → Export progress** to back it up.
