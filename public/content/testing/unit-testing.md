---
title: Unit Testing
summary: Writing fast, focused tests for individual units of code — Arrange-Act-Assert, naming, test doubles (stubs, mocks, fakes) and the FIRST properties.
difficulty: beginner
tags: [testing, unit-testing, mocking, csharp, typescript]
order: 2
related: [testing/automated-testing, testing/test-driven-development, testing/writing-test-cases, design/dependency-injection]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Unit Testing stub (no content).
---

A **unit test** checks a small piece of behaviour (a function, a class, a module) in isolation, quickly and deterministically. Unit tests are the base of most test suites: cheap to write, fast to run, and precise about what broke.

## Arrange, Act, Assert

Structure every test in three parts:

```csharp
public class DiscountCalculatorTests
{
    [Fact]
    public void Loyal_customer_gets_15_percent_off()
    {
        // Arrange
        var customer = new Customer { YearsAsCustomer = 6 };
        var calculator = new DiscountCalculator();

        // Act
        var discount = calculator.For(customer, total: 100m);

        // Assert
        Assert.Equal(15m, discount);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(4, 0)]
    [InlineData(5, 15)]   // boundary
    public void Discount_depends_on_loyalty(int years, decimal expected) =>
        Assert.Equal(expected, new DiscountCalculator().For(new Customer { YearsAsCustomer = years }, 100m));
}
```

The same shape in TypeScript with Vitest (Angular's default test runner since v21):

```ts
import { describe, expect, it } from 'vitest';

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips punctuation', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });
});
```

## Naming

A test name should read as a **specification**: what scenario, what expected behaviour. `Withdraw_more_than_balance_throws` beats `TestWithdraw2`. When it fails, the name alone should tell you what's broken.

## What is a "unit"?

There are two schools:

- **London / mockist:** a unit is a single class; mock all its collaborators.
- **Classical / Detroit:** a unit is a *unit of behaviour*, possibly several classes working together; mock only things that are slow, non-deterministic or external (database, network, clock).

Classical tests are usually more resilient to refactoring. Mock at the **boundaries**, not between every pair of classes.

## Test doubles

| Double | What it does | Example |
| --- | --- | --- |
| **Dummy** | Fills a parameter; never used | `null` logger |
| **Stub** | Returns canned answers | Repository stub returning one fixed order |
| **Fake** | A working lightweight implementation | In-memory repository |
| **Spy** | Records how it was called | Counts emails "sent" |
| **Mock** | Pre-programmed with expectations, then verified | "`Send` must be called once with this address" |

```csharp
// Stubbing the clock makes time-dependent logic deterministic
var clock = Substitute.For<IClock>();          // NSubstitute
clock.UtcNow.Returns(new DateTime(2026, 11, 13));
var service = new SubscriptionService(clock);
```

This is where [dependency injection](../design/dependency-injection.md) pays off: anything injected can be replaced in a test.

> [!WARNING]
> Over-mocking produces tests that just restate the implementation ("calls A, then B with X"). They pass when the code is wrong and fail when you refactor correctly. Prefer asserting on **outputs and state** over verifying interactions.

## FIRST properties

Good unit tests are **F**ast, **I**ndependent (no ordering or shared state), **R**epeatable (same result everywhere), **S**elf-validating (pass/fail with no manual checking) and **T**imely (written alongside the code; see [TDD](test-driven-development.md)).

## What to unit test

- Business rules and calculations.
- Edge cases and boundaries (see [Writing Test Cases](writing-test-cases.md)).
- Bugs: write a failing test that reproduces the bug *before* fixing it, so it can't come back.

Skip trivial getters, framework code and third-party libraries.

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: How do you decide what to cover with unit tests versus integration tests?
A: Unit-test **logic** — calculations, rules, branching, edge cases — where fast, isolated tests pinpoint failures.
- Integration-test the **seams**: database queries, HTTP endpoints, serialisation, configuration, framework behaviour — things mocks would only pretend to verify.
- Avoid testing the same behaviour at every level; aim for the cheapest test that gives real confidence.
- Bugs that escaped are a signal: write the test at the level that would have caught it.

Q: When do mocks help, and when do they hurt?
A: **Help**: replacing slow, non-deterministic or external things — network, time, randomness, third-party APIs — and testing hard-to-trigger failures.
- **Hurt**: mocking everything between your own classes, so tests mirror the implementation ("calls A then B"). They break on safe refactors and pass when behaviour is wrong.
- Prefer real objects or fakes for your own code, mock at the boundaries, and assert on outcomes rather than interactions.

Q: Your CI has a few tests that fail randomly. What do you do?
A: Treat flaky tests as **bugs**, because they teach people to ignore red builds.
- Quarantine them quickly (so the main build is trustworthy) with an owner and a deadline.
- Find the cause: shared state between tests, test-order dependence, real time and timeouts, async races, network calls, environment differences.
- Fix by injecting clocks, awaiting conditions properly instead of sleeping, isolating data, and removing external dependencies.
- Avoid blanket retries — they hide real race conditions in the product too.
```

```recall
Q: What are the three parts of a well-structured unit test?
A: Arrange (set up inputs and dependencies), Act (call the code under test), Assert (check the outcome).

Q: What's the difference between a stub and a mock?
A: A stub supplies canned answers so the code can run; a mock is set up with expectations about how it will be called, and the test verifies those interactions.

Q: What does FIRST stand for in unit testing?
A: Fast, Independent, Repeatable, Self-validating, Timely.

Q: Why should you write a failing test before fixing a bug?
A: It proves the test reproduces the bug, confirms the fix works, and guards against the bug returning.

Q: What's the risk of over-mocking?
A: Tests become coupled to implementation details: they break on harmless refactors and can pass even when behaviour is wrong.
```
