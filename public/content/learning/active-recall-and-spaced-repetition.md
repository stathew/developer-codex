---
title: Active Recall & Spaced Repetition
summary: The two most robust findings in learning science, and how the codex's review system uses them to make knowledge stick.
difficulty: beginner
tags: [learning, memory, study-skills]
order: 1
related: [ai-era/developing-in-the-age-of-ai, codex/writing-codex-entries]
---

Re-reading feels productive because the material becomes familiar. But **familiarity isn't recall**. Two techniques consistently outperform it in research: retrieving information from memory (*active recall*) and doing so at increasing intervals (*spaced repetition*).

## Active recall

Every time you pull a fact out of memory, you strengthen the route to it. This is the **testing effect**: practising retrieval beats re-studying, even when the re-study time is longer.

In practice:

- Close the article and explain the concept out loud, or in writing.
- Answer recall questions *before* revealing the answer — even a wrong guess primes learning.
- Rebuild a diagram or a code snippet from scratch.

> [!RECALL]
> Throughout the codex you'll see **Recall** cards like the ones below. Try to answer before opening them — the effort is the point.

## Spaced repetition

Memories decay along a *forgetting curve*. Reviewing just as you're about to forget resets the curve and makes it shallower, so each review can wait longer than the last.

The codex uses a simple **Leitner system**:

| Box | Next review after |
| --- | --- |
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 16 days |
| 5 | 35 days |
| 6 | 90 days |

Answer *Good* and a card moves up a box; *Easy* skips one; *Hard* keeps it where it is for a day; *Again* sends it back to box 1 and repeats it in the same session. Cards you know well quickly stop costing you time, while the shaky ones get attention.

## How to use the codex for retention

1. **Read an entry** and try its inline recall questions.
2. **Mark it as studied** — its cards join your review deck.
3. **Review daily.** Five minutes is enough; consistency beats long sessions.
4. **Write your own entries** for things you learn on the job. Producing an explanation is itself powerful retrieval practice — see [Writing Codex Entries](../codex/writing-codex-entries.md).

## Other evidence-based techniques

- **Interleaving** — mix topics in a session instead of blocking one at a time.
- **Elaboration** — ask *why* and *how* a fact connects to what you know.
- **Concrete examples** — pair every abstraction with code you could run.

```recall
Q: What is the testing effect?
A: Practising retrieval (testing yourself) produces stronger long-term memory than spending the same time re-studying.

Q: In the Leitner system, what happens to a card you answer incorrectly?
A: It goes back to box 1 and is reviewed again soon.

Q: Why does re-reading feel more effective than it is?
A: It builds familiarity — recognising material — which is easily mistaken for being able to recall it.
```
