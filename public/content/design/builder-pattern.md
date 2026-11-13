---
title: Builder Pattern
summary: Construct complex objects step by step with a readable, fluent API instead of constructors with long parameter lists.
difficulty: beginner
tags: [design-patterns, creational, oop, testing]
order: 16
related: [design/factory-pattern, design/singleton-pattern]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Builder stub (no content). Follows the original Names / Intent / Motivation template.
---

**Type:** creational.

**Intent:** separate the construction of a complex object from its representation, so the same step-by-step process can build it readably and validate it once at the end.

## Motivation: the telescoping constructor

```csharp
// What do all these arguments mean?
var req = new HttpRequestSpec("https://api.example.com", "POST", null, 30, true, 3, headers, body);
```

Long parameter lists are hard to read, easy to get in the wrong order, and grow worse with every optional setting. A builder names each step:

```csharp
var req = new HttpRequestBuilder("https://api.example.com")
    .WithMethod(HttpMethod.Post)
    .WithJsonBody(order)
    .WithTimeout(TimeSpan.FromSeconds(30))
    .WithRetries(3)
    .Build();          // validates and returns an immutable object
```

## Implementation

```ts
class EmailBuilder {
  private to: string[] = [];
  private subject = '';
  private body = '';
  private attachments: File[] = [];

  addRecipient(address: string): this { this.to.push(address); return this; }
  withSubject(subject: string): this { this.subject = subject; return this; }
  withBody(body: string): this { this.body = body; return this; }
  attach(file: File): this { this.attachments.push(file); return this; }

  build(): Email {
    if (!this.to.length) throw new Error('An email needs at least one recipient');
    if (!this.subject) throw new Error('An email needs a subject');
    return Object.freeze({ to: [...this.to], subject: this.subject, body: this.body, attachments: [...this.attachments] });
  }
}
```

Each method returns `this`, which enables the **fluent** chaining style. `build()` is the single place to enforce invariants.

## Where you've seen it

- `StringBuilder` in .NET and Java.
- `WebApplication.CreateBuilder(args)` in ASP.NET Core and `HttpClientBuilder` in Java.
- Query builders (Knex, Entity Framework's LINQ chain).

## Test data builders

Builders shine in tests: provide sensible defaults and override only what each test cares about.

```csharp
var order = new OrderBuilder().WithStatus(OrderStatus.Shipped).Build();  // everything else defaulted
```

## When not to use it

For objects with a handful of fields, named or optional parameters, object initialisers (`new X { A = 1 }`), records or TypeScript object literals are simpler.

```recall
Q: What problem does the Builder pattern solve?
A: Constructing complex objects without long, error-prone constructor parameter lists — by setting parts step by step and validating once in build().

Q: What makes a builder "fluent"?
A: Each configuration method returns the builder itself, so calls can be chained.

Q: Why are builders useful in tests?
A: Test data builders supply sensible defaults, so each test overrides only the fields it cares about, keeping tests short and focused.
```
