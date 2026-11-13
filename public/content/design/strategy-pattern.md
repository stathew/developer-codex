---
title: Strategy Pattern
summary: Encapsulate interchangeable algorithms behind a common interface so the behaviour can be chosen at runtime instead of buried in conditionals.
difficulty: beginner
tags: [design-patterns, behavioral, oop]
order: 13
related: [design/solid-principles, design/factory-pattern, design/decorator-pattern]
status: needs-review
reviewNotes: Imported from the 2023 Strategy note (original intent text closely matched Wikipedia, so it was rewritten). Added example code and when-to-use guidance.
---

**Type:** behavioural · **Also known as:** Policy.

**Intent:** define a family of algorithms, put each behind the same interface, and let the caller pick one at runtime. The code using the algorithm doesn't know or care which one it's got.

## Before: branching on type

```ts
function shippingCost(order: Order, method: string): number {
  if (method === 'standard') return 4.99;
  if (method === 'express') return 9.99 + order.weightKg * 0.5;
  if (method === 'collect') return 0;
  throw new Error('Unknown method');  // every new method edits this function
}
```

## After: strategies

```ts
interface ShippingStrategy { cost(order: Order): number; }

const standard: ShippingStrategy = { cost: () => 4.99 };
const express: ShippingStrategy = { cost: (o) => 9.99 + o.weightKg * 0.5 };
const collect: ShippingStrategy = { cost: () => 0 };

class Checkout {
  constructor(private shipping: ShippingStrategy) {}
  total(order: Order) { return order.subtotal + this.shipping.cost(order); }
}

new Checkout(express).total(order);
```

Adding a new shipping method means adding a strategy — the `Checkout` class never changes (Open/Closed Principle).

> [!TIP]
> In languages with first-class functions, a strategy is often just a function: `(order: Order) => number`. You don't always need an interface and classes.

## When to use it

- Several variants of an algorithm (pricing, sorting, validation, compression).
- Long `if`/`switch` chains selecting behaviour by type or setting.
- You need to swap behaviour at runtime or in tests.

```recall
Q: What is the intent of the Strategy pattern?
A: Encapsulate a family of interchangeable algorithms behind a common interface so the one used can be selected at runtime.

Q: Which SOLID principle does Strategy directly support?
A: Open/Closed — new behaviour is added as new strategies without modifying the code that uses them.
```
