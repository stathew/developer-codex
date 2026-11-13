---
title: DRY — Don't Repeat Yourself
summary: Why DRY is about duplicated knowledge rather than duplicated code, and when a little duplication beats the wrong abstraction.
difficulty: beginner
tags: [principles, design, refactoring]
order: 3
related: [design/solid-principles]
status: needs-review
reviewNotes: Imported from the 2023 DRY note. Kept the definition and attribution to The Pragmatic Programmer; added the knowledge-vs-code distinction, the rule of three and WET/AHA counterpoints.
---

Andy Hunt and Dave Thomas coined **DRY** in *The Pragmatic Programmer* (1999). Their formulation:

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

## It's about knowledge, not text

DRY targets duplicated **knowledge** — a business rule, a validation constraint, a schema — expressed in more than one place. When the rule changes, every copy must change, and one inevitably gets missed.

```ts
// ❌ The "max 5 items" rule lives in three places
if (cart.length >= 5) showError();          // UI
if (body.items.length > 5) return 400;      // API
CHECK (item_count <= 5)                     // database

// ✅ One authoritative source
export const MAX_CART_ITEMS = 5;
```

Two blocks of code that *look* the same but represent **different** knowledge aren't a DRY violation. Merging them couples things that will later change for different reasons.

## Duplication vs the wrong abstraction

Premature de-duplication creates abstractions full of flags and special cases. Useful counterweights:

- **Rule of three** — tolerate duplication until the third occurrence shows the real pattern.
- **AHA** — *Avoid Hasty Abstractions*.
- Sandi Metz: *"duplication is far cheaper than the wrong abstraction."*

> [!AI]
> AI assistants happily generate near-identical code in several places, because each prompt is answered in isolation. Watch for duplicated business rules creeping in across AI-assisted changes.

```recall
Q: What does DRY actually require to be single-sourced?
A: Knowledge — business rules, constraints, schemas — not merely similar-looking code.

Q: What is the "rule of three"?
A: Wait until something is duplicated three times before abstracting it, so the abstraction reflects a real pattern.

Q: Who coined DRY, and where?
A: Andy Hunt and Dave Thomas, in The Pragmatic Programmer.
```
