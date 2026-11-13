---
title: Automated Testing
summary: Why automate tests, the kinds of test (unit, integration, end-to-end, contract), how to balance them, and how to keep a suite fast and trustworthy.
difficulty: beginner
tags: [testing, automation, ci, quality]
order: 1
related: [testing/unit-testing, testing/test-driven-development, testing/writing-test-cases, ai-era/reviewing-ai-generated-code]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Automated Testing stub (no content).
---

An **automated test** is code that runs your code and checks the result. A good suite lets you change things confidently: if you break something, a test fails within minutes, not a customer within days.

> [!AI]
> As AI writes more of the code, tests become the main way *you* specify behaviour and verify that it's still correct. A trustworthy test suite is what makes fast AI-assisted change safe.

## Kinds of automated test

| Kind | What it exercises | Speed | Typical tools |
| --- | --- | --- | --- |
| **Unit** | One function or class in isolation | Milliseconds | xUnit, NUnit, JUnit, Vitest, Jest |
| **Integration** | Several components together: your code plus a real database, queue or HTTP pipeline | Seconds | WebApplicationFactory, Testcontainers, Spring Boot Test |
| **End-to-end (E2E)** | The whole system through its UI or public API, like a user | Seconds to minutes | Playwright, Cypress, Selenium |
| **Contract** | That a provider and consumer agree on an API's shape | Fast | Pact, OpenAPI validation |

Other useful kinds: **snapshot** tests (output vs a stored copy), **property-based** tests (random inputs checked against invariants), **performance/load** tests (k6, JMeter) and **accessibility** checks (axe).

## Balancing the suite

### The test pyramid

The classic guidance is **many unit tests, fewer integration tests, few E2E tests**, because tests get slower, more brittle and harder to debug as their scope grows.

```text
        ▲   E2E           few, slow, high confidence per test
       ▲▲▲  Integration
     ▲▲▲▲▲▲ Unit          many, fast, pinpoint failures
```

### The testing trophy

A popular alternative, especially for web apps, puts **integration tests** at the centre. They test real behaviour through realistic seams, with less mocking than unit tests and less flakiness than E2E tests, plus a base of **static analysis** (type checking, linting).

The common ground: test behaviour at the **cheapest level that gives real confidence**, and don't duplicate the same check at every level.

## What makes a suite trustworthy

- **Deterministic:** no reliance on time, randomness, network or test order. Inject clocks and seeds.
- **Fast:** slow suites stop being run. Keep the default `test` command to a few minutes.
- **Isolated:** each test sets up its own data and cleans up after itself.
- **Behaviour-focused:** assert on outcomes, not implementation details, so refactoring doesn't break tests.
- **Failing for the right reason:** a red test should point straight at the problem.

> [!WARNING]
> **Flaky tests** (ones that pass and fail without code changes) are corrosive: people learn to ignore red builds. Quarantine and fix them quickly rather than adding retries.

## Measuring quality

- **Code coverage** shows what code ran, not whether it was checked. Treat it as a way to find untested areas, not a target. 100% coverage with weak assertions proves little.
- **Mutation testing** (Stryker, PIT) deliberately introduces bugs and checks that tests catch them. It's a far better signal of test strength, and especially useful for checking AI-generated tests.

## Running tests

Run fast tests on every save or commit, and the full suite in **CI** on every pull request, so nothing merges red.

```recall
Q: What's the difference between unit, integration and end-to-end tests?
A: Unit tests check one function or class in isolation; integration tests check several components together (e.g. code plus a real database); end-to-end tests drive the whole system through its UI or public API like a user.

Q: What does the test pyramid recommend?
A: Many fast unit tests, fewer integration tests and only a few slow end-to-end tests.

Q: Why is code coverage a poor target on its own?
A: It measures which code ran, not whether the tests actually check the results; high coverage with weak assertions catches few bugs.

Q: What is mutation testing?
A: Automatically introducing small bugs (mutants) into the code and checking whether the tests fail; surviving mutants reveal weak tests.

Q: Why are flaky tests so damaging?
A: They teach the team to ignore failing builds, so real failures get missed.
```
