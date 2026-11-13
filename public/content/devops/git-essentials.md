---
title: Git Essentials
summary: Git's data model — commits, trees, branches as pointers — and the everyday workflows (rebase, merge, recovering lost work) that follow from it.
difficulty: beginner
tags: [git, version-control, workflow]
order: 1
related: [devops/conventional-commits, devops/svn, devops/developer-tools-overview]
---

Most Git confusion disappears once you see its data model. Git is a **content-addressed store of snapshots** plus a few movable pointers.

## The model

- **Blob** — the contents of a file.
- **Tree** — a directory listing pointing to blobs and other trees.
- **Commit** — a pointer to a tree (the full snapshot), its parent commit(s), author and message.
- **Branch** — a movable label pointing to a commit. That's all. Creating a branch is writing 41 bytes.
- **HEAD** — which branch (or commit) you currently have checked out.

Every object is named by the hash of its content, so history is tamper-evident: change anything and every later hash changes.

## Everyday commands, explained by the model

```bash
git switch -c feature/search   # new label at the current commit, move HEAD to it
git add -p                     # stage chosen hunks into the index (next snapshot)
git commit -m "Add search"     # new commit; the branch label moves forward
git fetch                      # download remote commits; update origin/* labels only
git rebase origin/main         # replay your commits on top of the new main
git push --force-with-lease    # update the remote label, unless someone else moved it
```

## Merge vs rebase

- **Merge** creates a new commit with two parents. History is preserved exactly as it happened.
- **Rebase** re-creates your commits on a new base. History is linear, but commits get **new hashes**.

> [!WARNING]
> Don't rebase commits other people have already built on. Rewriting shared history forces everyone else to reconcile it. `--force-with-lease` (never plain `--force`) protects you from overwriting a teammate's push.

## Recovering "lost" work

Commits are almost never truly lost. The **reflog** records every position HEAD has had:

```bash
git reflog                     # find the hash from before the mistake
git switch -c rescue a1b2c3d   # put a branch label on it
```

## Small, reviewable commits

Especially with AI-assisted changes, keep commits focused: one logical change, a message explaining **why**, and nothing unrelated. `git add -p` is your friend for splitting a messy working tree.

```recall
Q: What is a Git branch, internally?
A: A movable pointer (a file containing a commit hash) — nothing more.

Q: What's the key difference in outcome between merge and rebase?
A: Merge preserves history with a merge commit; rebase replays commits onto a new base, producing a linear history with new commit hashes.

Q: How do you recover a commit after a bad reset or rebase?
A: Find its hash in `git reflog` and create a branch (or reset) pointing to it.

Q: Why use `--force-with-lease` instead of `--force`?
A: It refuses to overwrite the remote branch if someone else has pushed to it since you last fetched.
```
