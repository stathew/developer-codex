---
title: Agile, Scrum & Kanban
summary: The values behind Agile, how Scrum and Kanban put them into practice, and the anti-patterns that turn "agile" into ceremony.
difficulty: beginner
tags: [agile, scrum, kanban, process, teams]
order: 1
related: [process/waterfall, testing/test-driven-development, devops/conventional-commits]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 AGILE Workflow stub (heading only). Scrum terminology follows the 2020 Scrum Guide.
---

**Agile** is a family of approaches to software development built on short feedback loops: deliver working software in small increments, learn from real use, and adapt. The term comes from the **Manifesto for Agile Software Development** (2001).

## The four values

The manifesto values:

- **Individuals and interactions** over processes and tools
- **Working software** over comprehensive documentation
- **Customer collaboration** over contract negotiation
- **Responding to change** over following a plan

The items on the right still matter. The ones on the left matter *more*. The manifesto adds twelve principles, including frequent delivery, sustainable pace, technical excellence and regular reflection.

## Scrum

**Scrum** is the most widely used Agile framework. Work happens in fixed-length **Sprints** (one month or less, often two weeks), each producing a usable **Increment**.

| | |
| --- | --- |
| **Accountabilities** | **Product Owner** (maximises value; owns the Product Backlog), **Scrum Master** (coaches the team and the organisation in Scrum, removes impediments), **Developers** (everyone building the increment) |
| **Events** | Sprint; Sprint Planning; Daily Scrum (15 minutes, for the Developers to plan the next day); Sprint Review (inspect the increment with stakeholders); Sprint Retrospective (improve how the team works) |
| **Artifacts** | Product Backlog (with a **Product Goal**), Sprint Backlog (with a **Sprint Goal**), Increment (meeting the **Definition of Done**) |

### Common practices around Scrum

Scrum doesn't prescribe these, but many teams use them:

- **User stories:** *"As a returning customer, I want to reorder a previous basket so that I save time."*
- **Acceptance criteria**, often written as Given/When/Then, which pair well with [BDD/TDD](../testing/test-driven-development.md#variants).
- **Estimation** with story points or planning poker. Some teams skip estimates and just count stories.
- **Velocity** for forecasting. It's a planning tool, never a performance target.

## Kanban

**Kanban** focuses on **flow** rather than fixed iterations:

- **Visualise the work** on a board (To do → In progress → Review → Done).
- **Limit work in progress (WIP).** For example, at most three items in review. Finishing beats starting.
- **Manage flow:** measure **lead time** (request to delivery) and **cycle time** (start to delivery), and remove bottlenecks.
- **Pull** new work only when there's capacity.

Kanban suits continuous streams of work such as support, operations and platform teams. Many teams blend the two ("Scrumban").

## Agile anti-patterns

- **Cargo-cult ceremonies:** all the meetings, none of the feedback. If retrospectives never change anything, they're theatre.
- **Mini-waterfalls:** design in Sprint 1, build in Sprint 2, test in Sprint 3.
- **Velocity as a KPI:** teams inflate estimates. Goodhart's law: when a measure becomes a target, it stops being a good measure.
- **No technical excellence:** without automated tests, CI and refactoring, speed collapses after a few sprints.
- **Undone work:** "done except testing" isn't done. Hold to the Definition of Done.

> [!AI]
> AI assistants shrink the build step, which makes the *feedback* parts of Agile (talking to users, reviewing increments, refining the backlog) a larger share of the work, and more valuable.

```recall
Q: What are the four values of the Agile Manifesto?
A: Individuals and interactions over processes and tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan.

Q: What are the three Scrum accountabilities?
A: Product Owner, Scrum Master and Developers.

Q: Name the five Scrum events.
A: The Sprint, Sprint Planning, Daily Scrum, Sprint Review and Sprint Retrospective.

Q: What is a WIP limit in Kanban, and why use one?
A: A cap on how many items can be in a stage at once; it forces finishing over starting, exposes bottlenecks and shortens lead time.

Q: Why shouldn't velocity be used as a performance target?
A: Teams will inflate estimates to hit it (Goodhart's law), destroying its value for forecasting.
```
