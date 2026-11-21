---
title: LINQ Deep Dive
summary: Deferred execution, IEnumerable vs IQueryable, the operators you'll actually use, and the performance traps — multiple enumeration and accidental client-side evaluation.
difficulty: intermediate
tags: [csharp, dotnet, linq]
order: 7
related: [fundamentals/generics, databases/entity-framework-core, fundamentals/big-o-notation]
status: needs-review
reviewNotes: New entry in the C#/.NET fundamentals batch.
---

**LINQ** (Language Integrated Query) lets you query collections, databases and XML with the same syntax. The two forms compile to the same thing:

```csharp
var ukAdults = people.Where(p => p.Country == "UK" && p.Age >= 18).OrderBy(p => p.Name);   // method syntax
var ukAdults2 = from p in people where p.Country == "UK" && p.Age >= 18 orderby p.Name select p;   // query syntax
```

Method syntax is far more common in real code; query syntax reads better for multi-join queries.

## Deferred execution

Most LINQ operators don't run when you call them — they build up a description of the query, which runs when you **enumerate** it (`foreach`, `.ToList()`, `.Count()`, …).

```csharp
var query = orders.Where(o => o.Total > 100);   // nothing has run yet
orders.Add(new Order { Total = 500 });          // this order IS included — the query hadn't run
foreach (var o in query) { /* runs the filter now, sees the new order */ }
```

> [!WARNING]
> **Multiple enumeration** is a common, subtle bug: each time you enumerate a deferred query, it runs again from scratch.
> ```csharp
> var expensive = orders.Where(o => ExpensiveCheck(o));   // deferred
> if (expensive.Any()) Process(expensive.First());        // ExpensiveCheck runs twice, for different purposes
> ```
> Materialise with `.ToList()` once you're done composing the query and about to use the result more than once.

## IEnumerable vs IQueryable

- **`IEnumerable<T>`** — LINQ-to-Objects. The lambda you write is **compiled and run in .NET**, item by item, in memory.
- **`IQueryable<T>`** — what EF Core returns. Your lambda is captured as an **expression tree** and **translated to SQL** by the provider, running in the database.

```csharp
// IQueryable: translated to SQL, runs in the database — only matching rows come back
var recent = dbContext.Orders.Where(o => o.CreatedAt >= since).ToList();

// A LINQ-to-Objects method EF Core can't translate silently switches to client evaluation —
// EF Core 3+ throws instead of silently pulling the whole table, but the equivalent mistake
// is calling ToList() too early and filtering what's already in memory:
var inefficient = dbContext.Orders.ToList().Where(o => o.CreatedAt >= since);   // ❌ loads the whole table first
```

This is the single most important LINQ fact for anyone using EF Core: **where you call `.ToList()`/`.ToArray()` decides whether a `Where` runs in SQL or in your process's memory.** See [ORMs & Entity Framework Core](../databases/entity-framework-core.md#performance-traps).

## Operators worth knowing well

| Operator | Does |
| --- | --- |
| `Select` / `SelectMany` | Project each item / flatten a sequence of sequences |
| `Where` | Filter |
| `GroupBy` | Group by a key — produces `IGrouping<TKey, TElement>` |
| `Join` / `GroupJoin` | Relational-style joins between two sequences |
| `Aggregate` | A general fold/reduce when `Sum`/`Count`/`Max` aren't specific enough |
| `Distinct` / `DistinctBy` (.NET 6+) | De-duplicate, optionally by a key selector |
| `Chunk` (.NET 6+) | Split a sequence into fixed-size batches |
| `Zip` | Pair up elements from two sequences positionally |

```csharp
var spendByCustomer = orders
    .GroupBy(o => o.CustomerId)
    .Select(g => new { CustomerId = g.Key, Total = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.Total);
```

## LINQ and async

There's no built-in `WhereAsync`/`SelectAsync` in the base class library — `IEnumerable<T>` is synchronous by design. For async data sources, use `IAsyncEnumerable<T>` and `await foreach` (see [Async Streams](dotnet-async-streams-and-tasks.md)), or materialise with `ToListAsync()` (from EF Core) before applying ordinary synchronous LINQ to the in-memory result.

```recall
Q: What does "deferred execution" mean in LINQ?
A: Most query operators build a description of the query without running it; the query actually executes when you enumerate the result (foreach, ToList, Count, etc.).

Q: Why is enumerating the same deferred LINQ query twice risky?
A: Each enumeration re-runs the whole query from the source, which can mean duplicated expensive work (or, for a database query, duplicated round trips) — materialise with ToList() if you need the result more than once.

Q: What's the key practical difference between IEnumerable and IQueryable with EF Core?
A: IEnumerable (LINQ-to-Objects) runs your lambda in .NET process memory; IQueryable captures it as an expression tree translated to SQL and run in the database — calling ToList() too early switches later operators from the database to in-memory.

Q: Which LINQ feature would you reach for to split a sequence into fixed-size batches?
A: Chunk (added in .NET 6).
```
