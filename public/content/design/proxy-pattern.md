---
title: Proxy Pattern
summary: A stand-in object with the same interface as the real one that controls access to it — for lazy loading, caching, access control and remote calls.
difficulty: intermediate
tags: [design-patterns, structural, oop, performance]
order: 18
related: [design/decorator-pattern, design/adapter-pattern, databases/entity-framework-core]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Proxy stub (title only). Follows the original Names / Intent / Motivation template.
---

**Type:** structural · **Also known as:** Surrogate.

**Intent:** provide a substitute for another object that implements the **same interface** and controls access to it. Clients can't tell they're talking to a proxy.

## Kinds of proxy

| Kind | What it controls | Example |
| --- | --- | --- |
| **Virtual** | *When* the real object is created | Load a large image or entity only when first used |
| **Protection** | *Who* may call it | Check permissions before forwarding |
| **Remote** | *Where* it runs | A local object that forwards calls over the network (gRPC/WCF client stubs) |
| **Caching** | *Whether* to call at all | Return a cached result for repeated requests |

## Example: a protection proxy

```csharp
public interface IDocumentStore
{
    Task<Document> GetAsync(Guid id);
    Task DeleteAsync(Guid id);
}

public class SecureDocumentStore(IDocumentStore inner, ICurrentUser user) : IDocumentStore
{
    public Task<Document> GetAsync(Guid id) => inner.GetAsync(id);

    public Task DeleteAsync(Guid id)
    {
        if (!user.IsInRole("Admin"))
            throw new UnauthorizedAccessException("Only admins can delete documents.");
        return inner.DeleteAsync(id);
    }
}
```

## Example: a virtual proxy

```ts
class LazyReport implements Report {
  private real?: Report;
  constructor(private id: string, private load: (id: string) => Report) {}

  render(): string {
    this.real ??= this.load(this.id);   // expensive work deferred until first use
    return this.real.render();
  }
}
```

## Where you've seen it

- **ORM lazy loading:** Entity Framework and Hibernate generate proxy subclasses whose navigation properties query the database on first access. That convenience is also the source of [N+1 queries](../databases/entity-framework-core.md#performance-traps).
- **JavaScript `Proxy`:** intercepts property access; Vue's reactivity system is built on it.
- **Reverse proxies** (NGINX, YARP) apply the same idea at the network level.

## Proxy vs Decorator

They look identical in code: both wrap an object with the same interface. The difference is **intent**. A decorator *adds behaviour* and is usually composed by the client. A proxy *controls access* to the subject, often managing its lifecycle, and is usually transparent to the client.

```recall
Q: What is the Proxy pattern?
A: A stand-in object implementing the same interface as a real object, controlling access to it (when it's created, who may call it, where it runs, or whether a call is needed).

Q: Name four kinds of proxy.
A: Virtual (lazy creation), protection (access control), remote (forwards over the network) and caching.

Q: How is ORM lazy loading an example of the Proxy pattern?
A: The ORM returns proxy objects whose navigation properties load related data from the database only when first accessed.
```
