---
title: Rules Pattern
summary: Replace a sprawling chain of if/else business conditions with small, independent rule classes evaluated by a simple engine.
difficulty: intermediate
tags: [design-patterns, behavioral, refactoring, business-logic]
order: 20
related: [design/strategy-pattern, design/solid-principles]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Rules stub (title only). Interpreted as the Rules (rules engine) pattern popular in .NET circles; it isn't one of the original GoF patterns, so check that this matches what you intended.
---

**Type:** behavioural (not one of the original GoF 23) · **Also known as:** Rules Engine pattern.

**Intent:** move each business rule into its own small class with a common interface, and let a lightweight **engine** evaluate the set. Adding a rule means adding a class, not editing an ever-growing conditional.

## Motivation

```csharp
// ❌ Every new discount edits this method, and it keeps growing
public decimal CalculateDiscount(Customer c, Order o)
{
    decimal discount = 0;
    if (c.IsFirstOrder) discount = Math.Max(discount, 0.10m);
    if (c.YearsAsCustomer >= 5) discount = Math.Max(discount, 0.15m);
    if (o.Total > 500 && DateTime.Today.Month == 11) discount = Math.Max(discount, 0.20m);
    if (c.IsEmployee) discount = 0.30m;
    // … 20 more lines …
    return discount;
}
```

## The pattern

```csharp
public interface IDiscountRule
{
    bool Applies(Customer customer, Order order);
    decimal Discount { get; }
}

public class FirstOrderRule : IDiscountRule
{
    public bool Applies(Customer c, Order o) => c.IsFirstOrder;
    public decimal Discount => 0.10m;
}

public class LoyalCustomerRule : IDiscountRule
{
    public bool Applies(Customer c, Order o) => c.YearsAsCustomer >= 5;
    public decimal Discount => 0.15m;
}

// The engine: evaluates every rule and combines the results
public class DiscountEngine(IEnumerable<IDiscountRule> rules)
{
    public decimal Calculate(Customer c, Order o) =>
        rules.Where(r => r.Applies(c, o)).Select(r => r.Discount).DefaultIfEmpty(0).Max();
}
```

Register the rules with DI (`services.AddTransient<IDiscountRule, FirstOrderRule>()` and so on) and the engine receives them all.

## Benefits

- **Open/Closed:** new rules are new classes; the engine doesn't change.
- **Single Responsibility:** each rule is tiny, named and unit-testable in isolation.
- **Readable:** the list of rule classes *is* the list of business rules.

## Design decisions

- **Combination policy:** take the best result, the first match, the sum, or "any rule fails means reject" (validation). Make it explicit in the engine.
- **Ordering and priority:** if order matters, give rules a `Priority` property rather than relying on registration order.
- **Short-circuiting:** for validation, decide whether to stop at the first failure or collect all errors.

> [!TIP]
> If business users need to change rules **without a deployment**, you've outgrown this pattern. Look at a real rules engine (e.g. NRules, Microsoft RulesEngine, Drools) or data-driven rules stored in configuration.

## Strategy vs Rules

[Strategy](strategy-pattern.md) **picks one** algorithm to run. Rules **evaluates many** conditions and combines their outcomes.

```recall
Q: What is the Rules pattern?
A: Encapsulating each business rule in its own class behind a common interface (e.g. Applies + Result), with a small engine that evaluates all the rules and combines the outcomes.

Q: How does the Rules pattern differ from Strategy?
A: Strategy selects one interchangeable algorithm to execute; the Rules pattern evaluates many independent rules and combines their results.

Q: When should you move from the Rules pattern to a full rules engine?
A: When non-developers need to change rules at runtime without a code deployment.
```
