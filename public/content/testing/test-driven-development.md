---
title: Test-Driven Development (TDD)
summary: The red–green–refactor cycle, a worked example, what TDD is good and bad at, and how it pairs with AI coding assistants.
difficulty: intermediate
tags: [testing, tdd, workflow, refactoring, ai]
order: 4
related: [testing/unit-testing, testing/automated-testing, ai-era/prompting-for-code]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Test-Driven Development stub (filed under Development Lifecycle › Programming Approaches; moved to Testing & Quality).
---

**Test-driven development** is a workflow, popularised by Kent Beck, where you write a failing test **before** the code that makes it pass. The tests drive the design one small step at a time.

## Red, green, refactor

1. **Red:** write a small test for the next bit of behaviour. Run it and watch it **fail**, which proves the test can fail.
2. **Green:** write the **simplest** code that makes it pass. Hard-coding is allowed at this stage.
3. **Refactor:** clean up both code and tests while everything stays green.

Repeat in cycles of a few minutes.

## A worked example: a password rule

**Red.** Start with the simplest case:

```ts
it('rejects passwords shorter than 12 characters', () => {
  expect(validatePassword('short').valid).toBe(false);
});
```

**Green.** Do the minimum:

```ts
export function validatePassword(pw: string) {
  return { valid: pw.length >= 12 };
}
```

**Red.** Next behaviour:

```ts
it('rejects passwords without a digit', () => {
  expect(validatePassword('longenoughpassword').valid).toBe(false);
});
```

**Green, then refactor.** As rules accumulate, refactor towards a list of rules (the [Rules pattern](../design/rules-pattern.md)), with the tests guaranteeing nothing breaks:

```ts
const rules = [
  { test: (pw: string) => pw.length >= 12, message: 'At least 12 characters' },
  { test: (pw: string) => /\d/.test(pw), message: 'At least one digit' },
];

export function validatePassword(pw: string) {
  const errors = rules.filter((r) => !r.test(pw)).map((r) => r.message);
  return { valid: errors.length === 0, errors };
}
```

## Benefits

- **Every line has a reason:** code exists because a test demanded it, so coverage comes naturally.
- **Better design:** code that's easy to test tends to be loosely coupled with clear inputs and outputs.
- **Fearless refactoring:** the safety net is built as you go.
- **Executable specification:** the tests document intended behaviour.
- **Small steps:** you're rarely more than a few minutes from working code.

## Criticisms and limits

- It can feel slow for **exploratory or UI-heavy** work where you don't yet know what you're building. Spike first, then rebuild test-first.
- Done mechanically with heavy mocking, it produces tests coupled to implementation details. Test **behaviour**.
- It doesn't replace integration or end-to-end tests, or thinking about the overall design.

## Variants

- **Outside-in (London school):** start from an acceptance test at the system boundary and work inwards, mocking collaborators not yet built.
- **Inside-out (Detroit school):** build and test core units first, then compose them.
- **BDD (behaviour-driven development):** TDD phrased in domain language (*Given / When / Then*), often shared with non-developers (SpecFlow/Reqnroll, Cucumber).

## TDD in the age of AI

TDD pairs naturally with coding assistants:

1. **You** write the failing tests. They're your precise, unambiguous specification.
2. **The AI** writes code to make them pass.
3. **You** review and refactor, with the tests proving behaviour is preserved.

> [!AI]
> This flips a common failure mode. When an AI writes code *and* its tests, the tests tend to mirror whatever the code does, bugs included. When you write the tests first, they encode what the code *should* do.

```recall
Q: What are the three steps of the TDD cycle?
A: Red (write a failing test), Green (write the simplest code to pass it), Refactor (clean up while staying green).

Q: Why should you watch a new test fail before making it pass?
A: It proves the test actually checks something; a test that never fails can't catch bugs.

Q: Who popularised TDD?
A: Kent Beck (Test-Driven Development: By Example, and Extreme Programming).

Q: How does writing tests first improve AI-assisted coding?
A: Your tests become the specification; the AI writes code to satisfy them, rather than generating tests that just mirror its own (possibly buggy) implementation.

Q: How does BDD relate to TDD?
A: BDD applies test-first development using domain language (Given/When/Then) focused on behaviour, often shared with non-technical stakeholders.
```
