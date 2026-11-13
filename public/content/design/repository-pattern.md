---
title: Repository Pattern
summary: A collection-like abstraction over data storage that keeps persistence details out of your domain logic — and the debate about using it with an ORM.
difficulty: intermediate
tags: [design-patterns, architecture, data-access, ddd, ef-core]
order: 19
related: [databases/entity-framework-core, design/domain-driven-design, design/dependency-injection]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Repository stub (title only). Includes the "repository over EF Core?" debate, since EF's DbContext already implements Repository and Unit of Work.
---

**Type:** architectural / data access (from Martin Fowler's *Patterns of Enterprise Application Architecture* and Domain-Driven Design).

**Intent:** mediate between the domain and data storage with an interface that behaves like an **in-memory collection of domain objects**. Business code asks for "the order with this ID" without knowing about SQL, HTTP or caches.

## Example

```csharp
// Defined by the domain, in domain language
public interface IOrderRepository
{
    Task<Order?> GetAsync(OrderId id);
    Task<IReadOnlyList<Order>> GetOpenOrdersForCustomerAsync(CustomerId customer);
    void Add(Order order);
}

// Implemented by infrastructure
public class EfOrderRepository(ShopContext db) : IOrderRepository
{
    public Task<Order?> GetAsync(OrderId id) =>
        db.Orders.Include(o => o.Lines).SingleOrDefaultAsync(o => o.Id == id);

    public async Task<IReadOnlyList<Order>> GetOpenOrdersForCustomerAsync(CustomerId customer) =>
        await db.Orders.Where(o => o.CustomerId == customer && o.Status == OrderStatus.Open).ToListAsync();

    public void Add(Order order) => db.Orders.Add(order);
}
```

The service layer depends only on `IOrderRepository`, which is the [Dependency Inversion Principle](solid-principles.md#d-dependency-inversion-principle) in action.

## Benefits

- **Domain stays persistence-ignorant:** no SQL or ORM types in business rules.
- **Testable:** substitute an in-memory fake.
- **Intention-revealing queries:** `GetOpenOrdersForCustomerAsync` says *why*, not *how*.
- **One place** for query logic, eager-loading decisions and caching.

## Unit of Work

Repositories usually pair with a **Unit of Work** that tracks changes across several repositories and commits them in one transaction (`SaveChangesAsync()`).

## The debate: repository over an ORM?

> [!NOTE]
> EF Core's `DbContext` already *is* a Unit of Work, and each `DbSet<T>` is already a repository. Wrapping them again is sometimes pure ceremony.

| Add your own repositories when… | Use the ORM directly when… |
| --- | --- |
| You follow DDD with aggregates and want a narrow, domain-shaped API | The app is CRUD-heavy with little domain logic |
| You want to keep ORM types out of the domain layer | Abstractions would just forward every call |
| You might swap or mix storage technologies | You'd lose ORM features (projection, `IQueryable` composition) behind the wrapper |

Avoid **generic repositories** (`IRepository<T>` with `GetAll()`, `Find(predicate)`). They leak query concerns, encourage loading whole tables, and add little over `DbSet<T>`.

```recall
Q: What is the Repository pattern?
A: An abstraction that presents stored domain objects like an in-memory collection, hiding persistence details from domain logic.

Q: What is a Unit of Work, and how does it relate to repositories?
A: It tracks changes across repositories and commits them atomically in one transaction; in EF Core, DbContext plays this role.

Q: Why are generic repositories (`IRepository<T>`) often discouraged?
A: They add little over the ORM's own DbSet, leak query logic to callers, encourage inefficient queries like GetAll, and don't express domain intent.
```
