---
title: Domain-Driven Design
summary: Modelling software around the business domain — ubiquitous language, bounded contexts, entities, value objects, aggregates and domain events.
difficulty: advanced
tags: [ddd, architecture, design, modelling, microservices]
order: 31
related: [design/repository-pattern, backend/event-driven-architecture, design/model-view-controller, design/adapter-pattern]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Domain Driven Design stub (no content).
---

**Domain-Driven Design (DDD)** is an approach to building complex software by putting the **business domain** (its concepts, rules and language) at the centre of the design. It was introduced by Eric Evans in *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003).

DDD has two halves: **strategic design** (how to divide a large system) and **tactical design** (patterns for modelling inside one part).

## Strategic design

### Ubiquitous language

Developers and domain experts agree on a **shared vocabulary** and use it everywhere: in conversations, documentation and the **code itself**. If the business says "a policy is *lapsed*", the code has `Policy.Lapse()`, not `UpdateStatus(3)`.

### Bounded contexts

A large domain contains different models of the "same" thing. A *Customer* in Sales (leads, contacts, opportunities) isn't the same as a *Customer* in Billing (payment methods, invoices) or Support (tickets, SLAs). A **bounded context** is an explicit boundary within which one model and its language are consistent.

```text
┌──────────── Sales ────────────┐   ┌─────────── Billing ───────────┐
│ Customer: leads, opportunities│──▶│ Customer: account, invoices   │
│ Quote, Discount               │   │ Invoice, PaymentMethod        │
└───────────────────────────────┘   └───────────────────────────────┘
```

Bounded contexts often map well to **microservices** or modules, and to **team boundaries**.

### Context mapping

A **context map** describes how contexts relate: who depends on whom, shared kernels, published languages. An **anti-corruption layer** translates another context's model (often a legacy system) into yours, so its concepts don't leak in. It's the [Adapter pattern](adapter-pattern.md) at the architectural level.

## Tactical design: building blocks

| Building block | What it is | Example |
| --- | --- | --- |
| **Entity** | Has an identity that persists as its attributes change | `Order` with an `OrderId` |
| **Value object** | Defined only by its values; immutable; no identity | `Money(42.50, "GBP")`, `Address` |
| **Aggregate** | A cluster of objects treated as one consistency boundary, accessed via its **root** | `Order` (root) + its `OrderLine`s |
| **Domain event** | A significant fact in the domain | `OrderPlaced` |
| **Repository** | Loads and saves whole aggregates | [`IOrderRepository`](repository-pattern.md) |
| **Domain service** | Domain logic that doesn't belong to a single entity | `PricingService` |

```csharp
public sealed record Money(decimal Amount, string Currency)            // value object
{
    public Money Add(Money other) => other.Currency == Currency
        ? this with { Amount = Amount + other.Amount }
        : throw new InvalidOperationException("Currency mismatch");
}

public class Order                                                     // aggregate root
{
    private readonly List<OrderLine> _lines = [];
    public OrderId Id { get; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public IReadOnlyList<OrderLine> Lines => _lines;

    public void AddLine(ProductId product, int quantity, Money price)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("Order is no longer editable");
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        _lines.Add(new OrderLine(product, quantity, price));          // invariants enforced by the root
    }
}
```

### Aggregate rules of thumb

- Keep aggregates **small**.
- Reference other aggregates **by ID**, not by object reference.
- Change **one aggregate per transaction**; use domain events for eventual consistency across aggregates. See [Event-Driven Architecture](../backend/event-driven-architecture.md).
- All changes go **through the root**, which enforces the invariants.

A model that's just data classes with all the logic in services is called an **anemic domain model**. DDD favours rich models where behaviour lives with the data.

## When to use DDD

DDD pays off for **complex business domains** with rich rules and long-lived systems. For simple CRUD applications, the tactical patterns add ceremony without benefit. Even then, **ubiquitous language** and **bounded contexts** are valuable almost everywhere.

```recall
Q: What is a bounded context?
A: An explicit boundary within which a particular domain model and its ubiquitous language are consistent; the same term can mean different things in different contexts.

Q: What's the difference between an entity and a value object?
A: An entity has an identity that persists over time as its attributes change; a value object is defined only by its values, is immutable and has no identity.

Q: What is an aggregate?
A: A cluster of domain objects treated as a single consistency boundary, modified only through its root, which enforces the invariants.

Q: What is an anti-corruption layer?
A: A translation layer that converts another context's (often legacy) model into your own, so its concepts don't leak into your domain.

Q: What is ubiquitous language?
A: A shared vocabulary between developers and domain experts, used consistently in conversation, documentation and code.
```
