---
title: Prompting for Code
summary: How to give an AI assistant the context, constraints and acceptance criteria it needs to produce code you'd actually merge.
difficulty: beginner
tags: [ai, prompting, productivity]
order: 3
related: [ai-era/reviewing-ai-generated-code, ai-era/developing-in-the-age-of-ai]
---

A coding assistant can only use what it can see. Most disappointing output traces back to a prompt that left out the context a teammate would have asked for.

## The anatomy of a good coding prompt

| Element | Example |
| --- | --- |
| **Goal** | "Add pagination to the `/orders` endpoint." |
| **Context** | "We use Express + Prisma; see `routes/products.ts` for the existing pattern." |
| **Constraints** | "Cursor-based, not offset. No new dependencies." |
| **Acceptance criteria** | "Returns `nextCursor`; handles an empty result; existing tests still pass." |
| **Output shape** | "Show a diff only for the files you change." |

## Techniques that work

### Point at an exemplar

"Follow the pattern in `X`" beats paragraphs describing your conventions. Assistants are excellent at imitation.

### Ask for a plan first

For anything non-trivial, ask for an approach and the files it would touch *before* any code. Correcting a plan is cheaper than correcting 300 lines.

### State what not to do

Negative constraints prevent the most common unwanted "helpfulness": *don't change the public API*, *don't add a library*, *don't modify tests to make them pass*.

### Iterate in small steps

Generate → run → review → refine. Long, single-shot generations compound small misunderstandings.

> [!TIP]
> When the output is wrong, say *why* it's wrong ("this loads every row into memory; we have 50M orders") rather than just asking again. The reason is the missing context.

## Prompting is not a substitute for knowing

Better prompts get you better drafts. They don't tell you whether the draft is correct — that's still on you. Treat a strong prompt as a **specification you'd be happy to hand a human**: if it's too vague for a colleague, it's too vague for a model.

```recall
Q: What five elements make up a strong coding prompt?
A: Goal, context (including exemplar files), constraints, acceptance criteria, and the desired output shape.

Q: Why ask an assistant for a plan before code on non-trivial tasks?
A: It's much cheaper to correct a misunderstanding in a short plan than in hundreds of generated lines.
```
