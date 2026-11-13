---
title: Developing in the Age of AI
summary: Why deep fundamentals matter more — not less — when an assistant can generate code on demand, and how to stay the engineer rather than the operator.
difficulty: beginner
tags: [ai, career, mindset, learning]
order: 1
related: [ai-era/reviewing-ai-generated-code, ai-era/prompting-for-code, learning/active-recall-and-spaced-repetition]
---

AI coding assistants have changed *how* software gets typed. They haven't changed what makes software **correct, secure, maintainable and fast**. Those properties still come from someone understanding the system — and increasingly, that someone's main job is judging code rather than producing it.

## The shift: from writing to judging

When generation becomes cheap, the scarce skills move:

| Cheap now | Still scarce (and more valuable) |
| --- | --- |
| Boilerplate, CRUD, glue code | Knowing *what* to build and *why* |
| Recalling API signatures | Spotting the subtle bug in plausible code |
| First drafts of tests | Choosing the right test boundaries |
| Translating between languages | Designing data models and interfaces |
| Explaining unfamiliar code | Deciding which trade-off fits *this* system |

> [!AI]
> An assistant optimises for code that *looks* right for the prompt. Only you can check it against the parts of the context it never saw: the production load, the security model, the on-call engineer at 3 a.m.

## The comprehension debt trap

It is now possible to ship code you could not have written and do not fully understand. Each time that happens you take on **comprehension debt**: the next bug, review or extension in that area will cost more, because nobody holds a mental model of it.

Signs you're accumulating it:

- You accept a suggestion because the tests pass, not because you can explain it.
- Debugging means re-prompting until the error goes away.
- You can't predict what a change will break before you make it.

The fix isn't avoiding AI — it's making sure **understanding keeps pace with output**.

## What to keep in your own head

You don't need to memorise everything. You do need enough internal knowledge to *evaluate* what you're handed. A useful heuristic is to own the layer *below* the one you work in:

1. **Complexity & data structures** — so you notice the accidental `O(n²)` in a generated loop. See [Big-O Notation](../fundamentals/big-o-notation.md).
2. **How your platform executes code** — the event loop, the rendering pipeline, the query planner.
3. **Security fundamentals** — injection, auth, trust boundaries. Assistants reproduce insecure patterns found in their training data.
4. **Your system's invariants** — the rules the code must never violate, which no prompt fully conveys.

## A working loop that keeps you sharp

1. **Think first.** Sketch the approach before prompting. Your sketch is the yardstick for the AI's answer.
2. **Generate in small slices.** Reviewable diffs beat impressive ones.
3. **Explain it back.** If you can't explain a line, ask — or read the docs — until you can.
4. **Make it fail.** Break the code deliberately; confirm the tests catch it.
5. **Capture the lesson.** Turn anything surprising into a codex note or a recall card.

> [!TIP]
> Occasionally solve a problem with the assistant switched off. It's the coding equivalent of a fire drill — and it shows you exactly where your knowledge has thinned.

## Recall

```recall
Q: What is "comprehension debt"?
A: The growing cost of maintaining code nobody on the team fully understands — common when AI-generated code is accepted without being understood.

Q: Which skills become *more* valuable as code generation gets cheaper?
A: Judgement skills: deciding what to build, designing data models and interfaces, spotting subtle bugs, evaluating trade-offs, and knowing the system's invariants.

Q: What's a good heuristic for how deep your own knowledge should go?
A: Understand at least the layer *below* the one you work in, so you can evaluate the code you're given.
```
