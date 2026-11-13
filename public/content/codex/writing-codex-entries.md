---
title: Writing Codex Entries
summary: The authoring guide — folder layout, front matter, recall cards, callouts, cross-links and interactive HTML entries.
difficulty: beginner
tags: [codex, authoring, markdown]
order: 1
related: [learning/active-recall-and-spaced-repetition]
---

Every entry is a file in `public/content/`. The folder is the category; the path (without extension) is the entry's permanent URL. Run `npm start` and edits are re-indexed automatically — just refresh.

## Folder layout

```text
public/content/
├── categories.json            # category titles, icons, descriptions, order
├── _shared/                   # assets for interactive entries (ignored by the indexer)
├── backend/
│   └── rest-api-design.md     # → /a/backend/rest-api-design
└── fundamentals/
    └── sorting-visualizer.html
```

Files and folders starting with `_` or `.` are ignored.

## Front matter

```markdown
---
title: REST API Design
summary: One or two sentences shown in lists and search results.
difficulty: intermediate          # beginner | intermediate | advanced
tags: [api, http, rest]
order: 1                          # position within the category (default 100)
related: [backend/authentication-sessions-vs-tokens]
updated: 2026-11-13               # optional; defaults to file modified date
draft: true                       # optional; hides the entry
---
```

## Markdown features

Standard GitHub-flavoured Markdown works: tables, task lists, fenced code with syntax highlighting.

### Callouts

```markdown
> [!NOTE]
> Neutral information.
```

Available types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`, `AI` (for AI-assisted-development angles) and `RECALL`.

> [!TIP]
> This is a tip callout.

### Links between entries

Link to other entries by relative file path — the codex turns them into app routes, and you can deep-link headings:

```markdown
See [Big-O Notation](../fundamentals/big-o-notation.md#hidden-loops).
```

Links are checked when the codex is indexed. A link to a missing entry, heading, category or file fails the build, with the file and line number in the error. While `npm start` is running, problems are reported in the terminal as you save.

### Recall cards

Recall cards are the heart of retention. Write them in a `recall` fenced block — they render inline as self-test cards *and* feed the spaced-repetition deck:

````markdown
```recall
Q: What does idempotent mean?
A: Repeating the operation has the same effect as doing it once.

Q: Answers can be **multi-line** Markdown.
A: Including lists:
- like this
- and `code`
```
````

Good recall questions:

- test **one** idea each;
- ask *why* and *when*, not just *what*;
- are answerable without seeing the article.

## Interactive HTML entries

For simulations and visualisations, add a standalone `.html` file. Put its front matter inside an HTML comment, and include the shared helpers to follow the app theme and auto-size the frame:

```html
<!doctype html>
<!--
---
title: Sorting Algorithm Visualizer
summary: Watch sorting algorithms run step by step.
tags: [algorithms, interactive]
---
-->
<html lang="en">
<head>
  <link rel="stylesheet" href="../_shared/codex-embed.css">
</head>
<body>
  ...
  <script type="text/x-recall">
Q: Optional recall cards work here too.
A: Like this.
  </script>
  <script src="../_shared/codex-embed.js"></script>
</body>
</html>
```

Interactive entries run in a sandboxed iframe (scripts allowed, no access to the app's storage). Their visible text is indexed for search.

```recall
Q: How do you add a recall card to a Markdown entry?
A: Write `Q:` / `A:` pairs inside a fenced code block whose language is `recall`.

Q: How do you link to another codex entry from Markdown?
A: Use a relative path to its file, e.g. `[Indexes](../databases/indexes.md)`; it's converted to an app route.
```
