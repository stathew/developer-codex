---
title: Subversion (SVN)
summary: The centralised version control system that preceded Git's dominance — its model, everyday commands, how it differs from Git, and migrating away.
difficulty: beginner
tags: [svn, version-control, git, legacy]
order: 4
related: [devops/git-essentials, devops/developer-tools-overview]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 SVN stub (no content).
---

**Apache Subversion (SVN)** is a **centralised** version control system, created in 2000 as a successor to CVS. Git has largely replaced it, but SVN remains in use in some long-established organisations and in teams with very large binary assets, so it's worth recognising.

## The centralised model

There's **one central repository** on a server. Developers **check out** a working copy, but history, branching and commits all happen **on the server**.

```text
          ┌──────────────┐
          │ SVN server   │  ← single source of truth, full history
          └──┬───┬───┬───┘
   checkout/ │   │   │ commit
          dev A dev B dev C   ← working copies (latest snapshot only)
```

Compare Git, which is **distributed**: every clone contains the full history, and you commit locally before pushing.

## Everyday commands

```bash
svn checkout https://svn.example.com/repo/trunk myproject   # get a working copy
svn update                         # pull others' changes into your working copy
svn status                         # what have I changed?
svn diff                           # show changes
svn add NewFile.cs                 # schedule a new file
svn commit -m "Fix order total"    # send changes straight to the server
svn log -l 10                      # recent history
```

## Revisions, branches and tags

- Each commit creates a new **global revision number** (r1234) for the whole repository, not a hash.
- **Branches and tags are directories**, created by cheap server-side copies. The conventional layout is:

```text
/trunk          main line of development
/branches/...   feature or release branches
/tags/...       release snapshots (by convention never modified)
```

## SVN vs Git

| | SVN | Git |
| --- | --- | --- |
| Model | Centralised | Distributed |
| Offline work | Limited (no commits or history offline) | Full |
| Branching | Directory copies; merging historically painful | Lightweight; branching is everyday practice |
| Identifiers | Sequential revision numbers | Content hashes |
| Partial checkout | Check out any subdirectory | Whole repo (sparse checkout possible) |
| Large binaries | Handles well; supports **file locking** | Needs Git LFS |
| Permissions | Fine-grained path-based access control | Repository-level |

SVN's genuine strengths are **path-based permissions**, **file locking** for unmergeable binaries (art assets, CAD files) and **partial checkouts** of huge repositories. That's why some game studios and engineering firms still use it, or Perforce.

## Migrating from SVN to Git

- `git svn clone` converts history (map SVN usernames to Git authors with an authors file).
- Tools such as SubGit or `svn2git` handle large repositories and convert branches and tags into real Git branches and tags.
- Plan the cutover: freeze SVN commits, run a final sync, update CI, and keep SVN read-only for reference.

```recall
Q: What's the key architectural difference between SVN and Git?
A: SVN is centralised (one server holds history; commits go straight to it); Git is distributed (every clone has full history; commits are local, then pushed).

Q: How are branches and tags represented in SVN?
A: As directories (conventionally /branches and /tags), created by cheap server-side copies.

Q: Name two things SVN does better than Git.
A: File locking for unmergeable binaries and fine-grained path-based permissions (also partial checkouts of subdirectories).

Q: What tool converts an SVN repository's history to Git?
A: git svn (or tools like SubGit and svn2git for larger migrations).
```
