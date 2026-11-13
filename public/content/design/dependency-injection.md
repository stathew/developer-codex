---
title: Dependency Injection
summary: Supplying a class's dependencies from outside instead of creating them inside — constructor injection, IoC containers and service lifetimes.
difficulty: intermediate
tags: [design-patterns, dependency-injection, ioc, csharp, angular]
order: 10
related: [design/solid-principles, design/singleton-pattern, design/repository-pattern]
status: needs-review
reviewNotes: Imported from the 2023 DI note (original text closely matched a published tutorial, so it was rewritten). Added constructor injection, IoC containers, .NET/Angular examples and service lifetimes.
---

**Also known as:** DI, a form of Inversion of Control (IoC).

**Intent:** a class receives the objects it depends on instead of constructing them itself. Something outside the class — usually an **IoC container** — decides which implementation to provide.

## Without and with DI

```csharp
// ❌ Hard-wired: can't swap the store or test without a real database
public class OrderService
{
    private readonly SqlOrderRepository _repo = new SqlOrderRepository("Server=…");
}

// ✅ Injected: depends on an abstraction, supplied from outside
public class OrderService(IOrderRepository repo)
{
    public Task<Order?> Find(Guid id) => repo.GetAsync(id);
}
```

## Ways to inject

- **Constructor injection** — the default. Dependencies are explicit and required.
- **Method/parameter injection** — for dependencies needed by a single operation.
- **Property injection** — optional dependencies; easy to forget to set, so use sparingly.

## IoC containers

A container maps abstractions to implementations and builds object graphs for you.

```csharp
// ASP.NET Core
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.AddSingleton<IClock, SystemClock>();
```

```ts
// Angular
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
}
```

## Service lifetimes (.NET)

| Lifetime | One instance per… | Typical use |
| --- | --- | --- |
| Transient | resolution | lightweight, stateless services |
| Scoped | request (scope) | `DbContext`, unit-of-work |
| Singleton | application | caches, configuration, clients like `HttpClient` handlers |

> [!WARNING]
> **Captive dependency:** a singleton that takes a scoped service (e.g. a `DbContext`) keeps it alive for the whole app — causing threading bugs and stale data. ASP.NET Core's scope validation catches this in development.

## Why it matters

- **Testability** — pass a fake `IOrderRepository` in unit tests.
- **Flexibility** — swap implementations (SQL → Cosmos, real → mock) via configuration.
- It's the usual way to achieve the [Dependency Inversion Principle](solid-principles.md#d-dependency-inversion-principle).

```recall
Q: What is dependency injection?
A: Supplying a class's dependencies from outside (typically via its constructor) rather than having the class create them itself.

Q: What's a captive dependency?
A: A longer-lived service (e.g. a singleton) holding a shorter-lived one (e.g. a scoped DbContext), extending its lifetime incorrectly.

Q: Which .NET lifetime is typical for a DbContext, and why?
A: Scoped — one per request, so each request gets its own unit of work and change tracker.

Q: Is dependency injection the same as dependency inversion?
A: No. Inversion is the principle (depend on abstractions); injection is a technique for supplying dependencies that's commonly used to achieve it.
```
