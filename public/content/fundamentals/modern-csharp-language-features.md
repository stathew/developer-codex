---
title: Modern C# Language Features
summary: Pattern matching, records, nullable reference types and the other syntax that's changed C# since C# 8 — what each is for and when to reach for it.
difficulty: intermediate
tags: [csharp, dotnet, language]
order: 6
related: [fundamentals/generics, design/object-oriented-programming, fundamentals/dotnet-memory-and-gc]
status: needs-review
reviewNotes: New entry opening the C#/.NET fundamentals batch. Version introductions (C# 8–13) checked against current Microsoft Learn docs on 2026-11-21.
---

C# has changed more in the last six years than in the ten before that. If you learned it around C# 6/7, this is the gap.

## Nullable reference types (C# 8)

With `<Nullable>enable</Nullable>` in the project file, reference types are **non-nullable by default**, and you opt in to nullability explicitly:

```csharp
public class Order
{
    public string Id { get; set; } = "";          // the compiler expects this to never be null
    public string? CancellationReason { get; set; } // explicitly nullable — callers must check
}

string FormatReason(Order order) =>
    order.CancellationReason is null ? "No reason given" : order.CancellationReason.ToUpper();
```

This is **compile-time analysis only** — it produces warnings, not runtime enforcement, so a library that lies about its nullability (or old code without it enabled) can still hand you a null the compiler promised wasn't possible.

## Pattern matching

Pattern matching has grown from simple type checks into a small language of its own for destructuring and branching.

```csharp
// Switch expression + property patterns + relational patterns (C# 8/9)
decimal ShippingCost(Order order) => order switch
{
    { Total: >= 100 } => 0,
    { Country: "UK", Total: > 50 } => 2.99m,
    { Country: "UK" } => 4.99m,
    _ => 9.99m,
};

// Type pattern with a declared variable
if (shape is Circle { Radius: var r } && r > 10) HighlightLargeCircle(r);

// List patterns (C# 11)
if (segments is [var first, .., var last]) ProcessEndpoints(first, last);
```

`switch` **expressions** (returning a value, no `break`, exhaustiveness checked by the compiler) are usually clearer than `switch` **statements** for anything that produces a result.

## Records (C# 9+)

A `record` gets **value equality** (two records are equal if their values match, not just their reference) and a concise **`with` expression** for non-destructive mutation, for free:

```csharp
public record Money(decimal Amount, string Currency);

var price = new Money(42.50m, "GBP");
var discounted = price with { Amount = price.Amount * 0.9m };   // a new Money; price is unchanged

price == new Money(42.50m, "GBP");   // true — value equality, unlike a class
```

Use records for **immutable data** — DTOs, value objects (see [Domain-Driven Design](../design/domain-driven-design.md)), message payloads. Use classes when identity matters more than value, or when the type has real behaviour and mutable state. `record struct` (C# 10) gives the same semantics as a value type, avoiding a heap allocation for small, frequently-created records.

## Other syntax worth knowing

```csharp
// Target-typed new (C# 9): the type is inferred from the declaration
List<Order> orders = new();

// Init-only setters (C# 9): settable only during object initialisation
public class Config { public string ApiKey { get; init; } = ""; }

// Primary constructors (C# 12): parameters are available throughout the class body
public class OrderService(IOrderRepository repo, ILogger<OrderService> logger)
{
    public Task<Order?> GetAsync(Guid id) => repo.GetAsync(id);
}

// Top-level statements (C# 9): Program.cs needs no class or Main method
var app = WebApplication.CreateBuilder(args).Build();
app.Run();

// Collection expressions (C# 12)
int[] numbers = [1, 2, 3];
List<string> names = [..existingNames, "Ada"];   // spread
```

> [!AI]
> Assistants trained on a lot of older C# frequently suggest classic constructor boilerplate, `switch` statements with `break`, or skip nullable annotations entirely. None of it is *wrong*, but reviewed code that ignores a decade of language improvements is a signal the suggestion wasn't written with your actual C# version in mind.

```recall
Q: What does enabling nullable reference types actually enforce?
A: Nothing at runtime — it's compile-time analysis that produces warnings when code might dereference a null reference-typed value; a lying library or legacy code can still hand you a null.

Q: Why does a record support value equality by default, unlike a class?
A: The compiler generates Equals/GetHashCode based on the record's property values, not reference identity, so two records with the same values are equal.

Q: What does a `with` expression do?
A: Creates a new record instance copying the original's values, with the specified properties replaced — the original is unchanged (non-destructive mutation).

Q: When would you choose a record over a class?
A: For immutable data like DTOs, value objects and message payloads, where value equality and concise copying matter more than identity or complex mutable behaviour.
```
