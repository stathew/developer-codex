---
title: Async / Await
summary: Writing non-blocking code that reads like sequential code — what await really does, running work concurrently, and the classic mistakes.
difficulty: intermediate
tags: [async, concurrency, javascript, csharp]
order: 3
related: [frontend/browser-rendering-pipeline, backend/aspnet-core]
status: needs-review
reviewNotes: Expanded from the 2023 Async/Await note (one-sentence overview kept in spirit). Added how await works in JavaScript and C#, sequential vs concurrent execution, and common pitfalls.
---

`async`/`await` is syntax, available in JavaScript, C#, Python, Rust, Kotlin and others, for writing **asynchronous, non-blocking** code that reads like ordinary sequential code.

## What `await` actually does

`await` **pauses the current function** until a promise or task completes, **without blocking the thread**. While it waits, the thread is free to do other work — handle another request, keep the UI responsive.

```ts
async function loadUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);  // function suspends here; the thread does other work
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

An `async` function always returns a `Promise` (JS) or `Task` (C#), and exceptions inside it become a rejected promise or faulted task, which `try/catch` around an `await` catches.

## Sequential vs concurrent

```ts
// ❌ Sequential: ~2 round trips, one after the other
const user = await getUser(id);
const orders = await getOrders(id);

// ✅ Concurrent: both start immediately, total ≈ the slower one
const [user2, orders2] = await Promise.all([getUser(id), getOrders(id)]);
```

```csharp
// C# equivalent
var userTask = GetUserAsync(id);
var ordersTask = GetOrdersAsync(id);
await Task.WhenAll(userTask, ordersTask);
```

Only parallelise **independent** operations.

## Async is not parallel

Async is about *not waiting idly* on I/O (network, disk, database). It doesn't make CPU-bound work faster. JavaScript still runs your code on one thread; CPU-heavy work needs Web Workers. In .NET, use `Task.Run` or parallel APIs for CPU-bound work.

## Common mistakes

- **Forgetting `await`** — the operation runs unobserved and errors vanish. Enable lint rules such as `no-floating-promises`.
- **`await` inside a loop** when the iterations are independent — accidental sequential execution.
- **Blocking on async in C#** (`.Result`, `.Wait()`) — risks deadlocks and thread-pool starvation. Go "async all the way".
- **`async void`** in C# outside event handlers — exceptions can't be caught by the caller.
- **`forEach(async …)`** in JS — `forEach` doesn't wait; use `for…of` or `Promise.all(items.map(…))`.

```recall
Q: Does `await` block the thread?
A: No. It suspends the async function and frees the thread to do other work until the awaited operation completes.

Q: How do you run two independent async calls concurrently in JavaScript?
A: Start both, then await them together, e.g. `await Promise.all([a(), b()])`.

Q: Why is calling `.Result` on a Task in C# risky?
A: It blocks the thread synchronously, which can deadlock (with a synchronization context) and starve the thread pool.

Q: Does async/await make CPU-bound code faster?
A: No. It helps with I/O-bound waiting; CPU-bound work needs parallelism (workers, threads, Task.Run).
```
