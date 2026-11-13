---
title: Waterfall & the V-Model
summary: Sequential, plan-driven development — its phases, why it struggles with changing requirements, where it still fits, and how it compares with Agile.
difficulty: beginner
tags: [waterfall, process, sdlc, project-management]
order: 2
related: [process/agile, testing/automated-testing]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Waterfall Workflow stub (heading only).
---

**Waterfall** is a **sequential, plan-driven** way of building software. Each phase is completed and signed off before the next begins, and work flows "downhill" from one phase to the next:

```text
Requirements → Design → Implementation → Verification (testing) → Deployment → Maintenance
```

The name is usually traced to Winston Royce's 1970 paper on managing large software projects. Ironically, Royce presented the purely sequential model as **risky** and recommended feedback and iteration between phases. That nuance was largely lost in practice.

## Characteristics

- **Big up-front requirements and design:** a comprehensive specification agreed and signed off early.
- **Phase gates:** formal reviews and approvals between phases.
- **Heavy documentation:** each phase hands documents to the next.
- **Testing late:** verification happens after implementation is complete.
- **Fixed scope** is often paired with fixed time and cost in contracts.

## The V-model

The **V-model** is a variant that pairs each specification phase with a corresponding test level. Each test level verifies the phase opposite it:

```text
Requirements ─────────────────────── Acceptance testing
   System design ──────────────── System testing
      Architecture design ──── Integration testing
         Module design ──── Unit testing
                 \  Implementation  /
```

It makes test planning explicit from the start, but it's still sequential.

## Why it struggles

- **Requirements change.** Users often don't know what they need until they see working software. Late changes are expensive in a phase-gated process.
- **Late feedback.** Integration and testing come at the end, so design flaws surface when they're most costly to fix.
- **Late value.** Nothing is usable until near the end.
- **Risk is back-loaded.** Projects can look "90% done" for a long time.

## Where it can still fit

- **Stable, well-understood requirements** that are unlikely to change.
- **Heavy regulation or safety-critical work** (medical devices, aerospace, some government contracts) that requires formal documentation and sign-offs. Even there, teams often iterate *within* phases.
- **Hardware or physical dependencies,** where change after manufacturing is genuinely expensive.
- **Fixed-scope contracts,** though these increasingly use iterative delivery with defined milestones.

## Waterfall vs Agile

| | Waterfall | [Agile](agile.md) |
| --- | --- | --- |
| Planning | Up front, in detail | Continuous, just in time |
| Delivery | Once, at the end | Frequent small increments |
| Change | Expensive, controlled by change requests | Expected and welcomed |
| Testing | A phase after building | Continuous, often automated |
| Customer involvement | Mainly at the start and end | Throughout |
| Documentation | Comprehensive | Sufficient |
| Best for | Stable requirements, regulated environments | Uncertain or evolving requirements |

Most organisations today use a **hybrid**: high-level up-front planning, budgeting and compliance, with iterative delivery underneath.

```recall
Q: What are the classic phases of the Waterfall model?
A: Requirements, design, implementation, verification (testing), deployment and maintenance, completed in sequence.

Q: What's ironic about Winston Royce's 1970 paper?
A: It's credited as the origin of Waterfall, yet it described the purely sequential model as risky and recommended iteration and feedback.

Q: What does the V-model add to Waterfall?
A: It pairs each specification phase with a corresponding test level (e.g. requirements ↔ acceptance testing, module design ↔ unit testing).

Q: Why is Waterfall risky for projects with uncertain requirements?
A: Feedback and testing come late, so misunderstandings and design flaws are discovered when they're most expensive to fix.
```
