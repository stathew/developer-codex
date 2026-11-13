---
title: Decorator Pattern
summary: Add responsibilities to an object by wrapping it in another object with the same interface — a flexible alternative to subclassing.
difficulty: intermediate
tags: [design-patterns, structural, oop]
order: 14
related: [design/proxy-pattern, design/adapter-pattern, design/dependency-injection]
status: needs-review
reviewNotes: Imported from the 2023 Decorator note. Kept the intent description; filled the empty motivation section with an example, real-world uses and a note distinguishing it from TypeScript/Python decorator syntax.
---

**Type:** structural · **Also known as:** Wrapper.

**Intent:** attach extra responsibilities to an object dynamically by **wrapping it in another object that implements the same interface**. The core class's source doesn't change, and wrappers can be stacked — a flexible alternative to subclassing.

## Motivation

Suppose you need a repository that sometimes caches, sometimes logs, sometimes retries. Subclassing every combination (`CachingLoggingRepository`, …) explodes. Decorators compose instead:

```csharp
public interface IProductRepository { Task<Product?> GetAsync(int id); }

public class SqlProductRepository : IProductRepository { /* real data access */ }

public class CachingProductRepository(IProductRepository inner, IMemoryCache cache) : IProductRepository
{
    public Task<Product?> GetAsync(int id) =>
        cache.GetOrCreateAsync($"product:{id}", _ => inner.GetAsync(id));
}

public class LoggingProductRepository(IProductRepository inner, ILogger<LoggingProductRepository> log) : IProductRepository
{
    public async Task<Product?> GetAsync(int id)
    {
        log.LogInformation("Loading product {Id}", id);
        return await inner.GetAsync(id);
    }
}

// Stack them: logging → caching → SQL
IProductRepository repo = new LoggingProductRepository(
    new CachingProductRepository(new SqlProductRepository(), cache), log);
```

## Where you've seen it

- Java I/O: `new BufferedReader(new InputStreamReader(stream))`.
- .NET `Stream` wrappers (`GZipStream`, `BufferedStream`).
- HTTP middleware pipelines and `DelegatingHandler`s.

> [!NOTE]
> TypeScript/Python `@decorator` **syntax** is a language feature for annotating or wrapping classes and functions. It's related in spirit but isn't the same thing as the GoF Decorator pattern.

```recall
Q: What is the Decorator pattern?
A: Wrapping an object in another object that implements the same interface, adding behaviour before/after delegating to the wrapped object.

Q: Why prefer decorators over subclasses for optional behaviours like caching and logging?
A: Decorators compose at runtime in any combination, avoiding a subclass for every combination of features.
```
