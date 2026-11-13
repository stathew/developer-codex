---
title: Writing Test Cases
summary: Deciding *what* to test — equivalence partitioning, boundary values, decision tables and state transitions — and how to write a clear test case.
difficulty: beginner
tags: [testing, test-design, qa, edge-cases]
order: 3
related: [testing/unit-testing, testing/automated-testing, testing/test-driven-development]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Test Cases stub (no content).
---

A **test case** specifies one scenario: the starting conditions, the inputs or steps, and the **expected result**. Writing the test code is the easy part. The skill is choosing *which* cases give the most confidence for the least effort.

## Anatomy of a test case

| Field | Example |
| --- | --- |
| **ID / title** | TC-042: Reject withdrawal larger than the balance |
| **Preconditions** | Account exists with a balance of £100 |
| **Steps / input** | Withdraw £150 |
| **Expected result** | Error "Insufficient funds"; balance unchanged at £100 |
| **Priority** | High |

For automated tests the same information lives in the test's name and its Arrange/Act/Assert sections. For manual or exploratory testing, write it down explicitly.

## Techniques for choosing cases

### Equivalence partitioning

Divide inputs into groups the code should treat the same, and test **one representative per group**. For "age must be 18–65":

| Partition | Representative | Expected |
| --- | --- | --- |
| Below range | 10 | Rejected |
| In range | 30 | Accepted |
| Above range | 80 | Rejected |
| Invalid type | "abc", empty | Validation error |

### Boundary value analysis

Bugs cluster at the **edges** (`<` vs `<=`, off-by-one errors). Test on and either side of each boundary: **17, 18, 19** and **64, 65, 66**.

> [!TIP]
> Boundary analysis catches exactly the bug in the legacy FizzBuzz example (looping 0–99 instead of 1–100). See [Coding Exercises](../career/coding-exercises.md#fizzbuzz).

### Decision tables

When the outcome depends on **combinations** of conditions, list them all:

| Member? | Order > £50? | Free shipping? |
| --- | --- | --- |
| Yes | Yes | ✅ |
| Yes | No | ✅ |
| No | Yes | ✅ |
| No | No | ❌ |

Each row is a test case. Gaps and contradictions in the requirements become obvious.

### State transitions

For things with a lifecycle (orders, subscriptions, documents), test **valid transitions** (Pending → Paid → Shipped) and **invalid ones** (Shipped → Pending must be rejected).

## The usual suspects checklist

Whatever the feature, consider:

- **Empty, null, zero, one, many**, and very large.
- **Boundaries** and off-by-one errors.
- **Invalid formats:** wrong types, malformed dates, injection strings (`' OR 1=1 --`, `<script>`).
- **Unicode and locale:** emoji, accents, right-to-left text, decimal commas.
- **Time:** time zones, daylight-saving changes, leap years, month ends.
- **Concurrency:** two users editing the same thing; double-clicked submit buttons.
- **Failure:** timeouts, network errors, a dependency returning 500.

## Positive, negative and exploratory testing

- **Positive** cases confirm the feature works with valid input (the "happy path").
- **Negative** cases confirm it fails *gracefully* with invalid input.
- **Exploratory** testing is unscripted, time-boxed investigation by a curious human. It finds the cases nobody thought to write down; turn what you find into automated tests.

```recall
Q: What is equivalence partitioning?
A: Grouping inputs that the system should treat the same and testing one representative value from each group.

Q: For a valid range of 18–65, which values does boundary value analysis test?
A: 17, 18, 19 and 64, 65, 66 — on and either side of each boundary.

Q: When are decision tables useful?
A: When the outcome depends on combinations of conditions; each combination becomes a test case, exposing gaps in the requirements.

Q: What's the difference between positive and negative test cases?
A: Positive cases check correct behaviour with valid input; negative cases check graceful failure with invalid input.
```
