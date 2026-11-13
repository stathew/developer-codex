---
title: Working with Coding Agents
summary: Getting good results from AI agents that read, edit and run code on their own — task scoping, context files, verification loops, permissions and review.
difficulty: intermediate
tags: [ai, agents, productivity, workflow, code-review]
order: 6
related: [ai-era/prompting-for-code, ai-era/reviewing-ai-generated-code, testing/test-driven-development]
status: needs-review
reviewNotes: New entry from the topic-gaps batch. Kept tool-agnostic; no product-specific features are claimed.
---

A **coding agent** goes beyond autocomplete and chat. It works in a loop: read the codebase, plan, edit files, **run commands** (builds, tests, git), look at the results and iterate, often across many steps without you. Agents can run in your IDE, your terminal or the cloud.

That autonomy changes the developer's job: less typing, more **specifying, supervising and verifying**.

## Scope tasks well

Agents do best with tasks that are:

- **Clearly bounded:** "add cursor pagination to `/orders` following the pattern in `/products`", not "improve the API".
- **Verifiable:** there's a command that proves success (tests pass, build succeeds, a linter is clean).
- **Reviewable:** small enough that you can actually read the diff.

Break large features into steps, and review each step before the next.

## Give it context

- **Project instruction files.** Most agents read a file in the repository (such as `CLAUDE.md` or `AGENTS.md`) describing how to build, test and lint, conventions, and things not to touch. Keep it short and accurate, and update it when the agent repeats a mistake.
- **Point at examples:** "follow the pattern in `X`" works as well for agents as for people.
- **State constraints:** no new dependencies, don't change public APIs, don't edit tests to make them pass.

## Close the loop with verification

An agent that can run checks will fix many of its own mistakes. Make it easy:

- Fast, reliable `build`, `test` and `lint` commands.
- Write the **failing test first** and let the agent make it pass. See [TDD in the age of AI](../testing/test-driven-development.md#tdd-in-the-age-of-ai).
- Ask it to run the app or the specific scenario, not just the unit tests.
- Treat "the tests pass" as necessary but not sufficient: check that the tests test the right thing.

## Permissions and safety

Agents act with *your* access. Decide deliberately what they may do without asking:

- Reading files and running tests: usually fine.
- Installing packages, running database migrations, pushing code, deleting files, calling production systems: **require approval**.
- Run them in sandboxes, containers or separate worktrees for risky or unattended work.
- Keep secrets out of reach. Never give an agent production credentials it doesn't need.
- Content the agent reads (web pages, issues, files) can contain **prompt injection**. Instructions should come from you, not from data.

## Review like it matters

The output is code you're responsible for. Use the [AI code review checklist](reviewing-ai-generated-code.md):

- Read every line of the diff, not the agent's summary of it.
- Look for scope creep: unrelated "improvements", reformatted files, changed tests.
- Check edge cases, security, and fit with the existing codebase.
- Keep commits small and messages honest about what changed.

## Stay sharp

Delegating everything erodes the skills you need to judge the output (see [Developing in the Age of AI](developing-in-the-age-of-ai.md)). Use the time agents save to understand the system more deeply: read the diffs closely, ask *why*, and turn surprises into codex entries and recall cards.

```recall
Q: What makes a task well suited to a coding agent?
A: It's clearly bounded, verifiable by a command (tests/build/lint) and small enough to review properly.

Q: What belongs in a project instruction file (e.g. CLAUDE.md / AGENTS.md)?
A: How to build, test and lint; project conventions; constraints and things not to touch — kept short and accurate.

Q: Why is giving an agent a failing test effective?
A: It provides an unambiguous specification and a verification loop the agent can run until it passes.

Q: Which agent actions should normally require approval?
A: Installing dependencies, migrations, pushing code, deleting files, and anything touching production or secrets.

Q: Why isn't "all tests pass" enough when reviewing agent work?
A: The agent may have written or changed tests that don't check the right behaviour; you must review the tests and the code.
```
