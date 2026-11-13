---
title: Talking About Your Experience
summary: Preparing stories about your past work with the STAR method, plus the personal questions you should have your own answers ready for.
difficulty: beginner
tags: [interviews, career, communication]
order: 2
related: [career/technical-interview-questions, career/questions-for-the-interviewer]
status: needs-review
reviewNotes: Imported from the 2023 Examples of Experience note (intro kept) plus the "idea of success" question from Common Questions. The original list of example questions was never written, so the STAR method, question bank and a story template were added.
---

Interviewers will almost certainly ask about your experience with specific languages and frameworks, and then follow up with *"give me an example of when you…"*. Preparing a handful of stories in advance means you can run through them beforehand instead of improvising.

## The STAR method

Structure each story as:

- **Situation** — the context, briefly. *"Our checkout API was timing out during sales."*
- **Task** — your responsibility. *"I owned finding and fixing the cause."*
- **Action** — what **you** did, specifically. Say "I", not "we". This should be the longest part.
- **Result** — the outcome, with numbers where possible, and what you learned. *"p95 latency dropped from 4s to 300ms; we added a load test to CI."*

> [!TIP]
> Prepare five or six stories that can each flex to several questions: a hard bug, a conflict, a failure, leading something, learning something fast, and a decision you'd now make differently.

## Questions to prepare stories for

- Tell me about a time you debugged a difficult production issue.
- Describe a project you're proud of. What was your contribution?
- Tell me about a disagreement with a colleague and how you resolved it.
- Tell me about a time you made a mistake. What happened next?
- How have you used AI tools in your work, and how do you check their output?
- Describe a time you had to learn a new technology quickly.
- Tell me about a technical decision you'd make differently today.

## Personal questions

These have no model answer — write **your own** and revisit them before each interview.

- What is your idea of success?
- Why are you leaving your current role?
- Where do you want to be in a few years?
- What kind of team and work do you do your best in?

## Story template

```markdown
### <Story title>
- Situation:
- Task:
- Action (what *I* did):
- Result (numbers + lesson):
- Fits questions about:
```

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: Tell me about a difficult bug you tracked down in production.
A: Use **STAR**. A strong answer shows a *method*, not luck:
- Situation and impact: who was affected and how badly.
- How you narrowed it down: logs, metrics, traces, reproducing it, forming and testing hypotheses.
- The root cause and the fix — and why the obvious fix wasn't the real one.
- What you changed so it can't recur: a test, an alert, a runbook, a design change.
- Mention communicating with stakeholders during the incident.

Q: Tell me about a time you disagreed with a colleague or your lead.
A: Interviewers are looking for **respectful, evidence-based disagreement and commitment** once a decision is made.
- Describe the disagreement fairly — show you understood their position.
- Explain how you made your case: data, prototypes, trade-offs, not volume or seniority.
- Share the outcome honestly, including if you were wrong or the decision went the other way ("disagree and commit").
- Avoid stories where you're simply right and the other person is the villain.

Q: Describe a mistake you made at work and what happened next.
A: Pick a **real, meaningful** mistake — not a humblebrag ("I work too hard").
- Own it plainly: what you did and its impact.
- Focus on the response: how you noticed, fixed it, and who you told.
- Finish with what you changed in your process afterwards — that's the point of the question.

Q: How do you use AI coding tools, and how do you make sure the output is correct?
A: Show **judgement**, not just enthusiasm or avoidance.
- Be concrete: what you use them for (boilerplate, tests, exploring unfamiliar code, refactoring) and what you don't.
- Explain verification: you read every line, run tests, check edge cases and security, and keep changes small enough to review.
- Mention specific failure modes you've caught: hallucinated APIs, insecure patterns, plausible-but-wrong logic.
- Note that you keep your own fundamentals sharp so you can judge the output.

Q: Tell me about a time you had to learn a new technology quickly.
A: Show a **learning strategy** and a result.
- Context: why it was needed and the deadline.
- How you learned: official docs, a small spike or prototype, reading existing code, asking experts — and how you checked your understanding.
- The outcome, plus how you shared what you learned with the team (docs, a talk, pairing).

Q: Why do you want this role?
A: Connect **their** needs to **your** experience and goals — it's not a question about you alone.
- Show you've researched the company: product, tech stack, recent news, engineering blog.
- Link two or three specific things in the role to what you've done and want to do more of.
- Be genuine and specific; generic praise ("great culture") is forgettable.
```

```recall
Q: What does STAR stand for?
A: Situation, Task, Action, Result.

Q: Which part of a STAR answer should be the longest, and why?
A: Action — it shows what *you* specifically did, which is what the interviewer is assessing.

Q: Why prepare a small set of flexible stories rather than one per question?
A: A few well-rehearsed stories can be adapted to many behavioural questions, so you're never improvising from scratch.
```
