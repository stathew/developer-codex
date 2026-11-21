---
title: Async Streams & Advanced Task Patterns in .NET
summary: IAsyncEnumerable and await foreach, Task composition (WhenAll/WhenAny), ValueTask, and cancellation tokens — the C#-specific depth beyond basic async/await.
difficulty: advanced
tags: [csharp, dotnet, async]
order: 8
related: [fundamentals/async-await, fundamentals/linq-deep-dive, backend/event-driven-architecture]
status: needs-review
reviewNotes: New entry in the C#/.NET fundamentals batch — the C#-specific depth beyond the cross-language fundamentals/async-await entry.
---

[Async/Await](async-await.md) covers the core concept across languages. This entry covers the C#-specific tools for streaming data and composing tasks that come up constantly in real .NET code.

## Async streams: `IAsyncEnumerable<T>`

A regular `IEnumerable<T>` can't `await` while producing items. `IAsyncEnumerable<T>` (C# 8) can — each item can be fetched asynchronously, and the consumer processes items as they arrive instead of waiting for the whole collection:

```csharp
public async IAsyncEnumerable<Order> GetOrdersAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    await foreach (var row in dbContext.Orders.AsAsyncEnumerable().WithCancellation(ct))
        yield return Map(row);
}

// Consuming it — processing starts on the first item, not after all of them load
await foreach (var order in GetOrdersAsync(cancellationToken))
{
    await ProcessAsync(order);
}
```

This is a good fit for large result sets, paging through an API, or any producer that yields results over time (see [Event-Driven Architecture](../backend/event-driven-architecture.md) for the message-based version of the same idea).

## Composing tasks

```csharp
// Run independent work concurrently, then continue once everything's done
var ordersTask = GetOrdersAsync(customerId);
var invoicesTask = GetInvoicesAsync(customerId);
await Task.WhenAll(ordersTask, invoicesTask);
var summary = new CustomerSummary(await ordersTask, await invoicesTask);

// React to whichever finishes first — e.g. a timeout race
var completed = await Task.WhenAny(FetchFromPrimaryAsync(), Task.Delay(TimeSpan.FromSeconds(5)));
```

> [!WARNING]
> `Task.WhenAll` only throws the **first** exception from a faulted task by default, even if several failed. If you need every error, inspect `Task.Exception` on each task after awaiting, or use `.Exception.Flatten()` on the aggregate.

## `ValueTask<T>`: avoiding an allocation on the common path

`Task<T>` is a reference type — allocated on the heap every time. For a method that's **usually synchronous** (a cache hit, say) and only occasionally truly asynchronous, `ValueTask<T>` avoids that allocation on the fast path:

```csharp
public ValueTask<Product?> GetAsync(int id)
{
    if (_cache.TryGetValue(id, out var cached)) return ValueTask.FromResult(cached);   // no allocation
    return new ValueTask<Product?>(LoadFromDatabaseAsync(id));                         // genuinely async path
}
```

> [!WARNING]
> A `ValueTask` has real restrictions a `Task` doesn't: **don't `await` it twice**, and don't call `.Result`/`.GetAwaiter().GetResult()` on it carelessly outside the one await. If in doubt, or if you need to store/pass it around before awaiting, use `Task<T>` — it's more forgiving and the allocation rarely matters outside hot paths.

## Cancellation tokens: propagate, don't ignore

A `CancellationToken` should flow through **every** async call in the chain — accepting one but not passing it on silences cancellation partway through:

```csharp
public async Task<Order> PlaceOrderAsync(OrderRequest request, CancellationToken ct)
{
    ct.ThrowIfCancellationRequested();                 // check early, cheaply
    var customer = await _customers.GetAsync(request.CustomerId, ct);   // pass it on
    return await _repository.SaveAsync(new Order(customer, request), ct);
}
```

ASP.NET Core supplies one automatically (`HttpContext.RequestAborted`) tied to the client disconnecting — accept it as a parameter in a minimal API handler or controller action and the framework wires it up for you.

```recall
Q: What can `IAsyncEnumerable<T>` do that `IEnumerable<T>` can't?
A: Produce items asynchronously, one at a time, so the consumer can start processing (via await foreach) before the whole sequence is available.

Q: Why does Task.WhenAll only surface one exception by default when several tasks fail?
A: It throws the first faulted task's exception; to see all failures you inspect each task's Exception property or use AggregateException.Flatten().

Q: When would you use `ValueTask<T>` instead of `Task<T>`?
A: For a method that's usually synchronous (e.g. a cache hit) and only occasionally genuinely async, to avoid a heap allocation on the common fast path — with the caveat that a ValueTask must not be awaited more than once.

Q: Why should a CancellationToken be passed to every downstream async call rather than just checked once?
A: Cancellation needs to propagate through the whole chain; checking it only at the top and not forwarding it means downstream work keeps running after the caller has given up.
```
