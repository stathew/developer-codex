---
title: .NET Memory, Span<T> & Garbage Collection
summary: Value vs reference types, how the generational GC works, Server vs Workstation modes, and using Span<T>/ArrayPool<T> to cut allocations.
difficulty: advanced
tags: [csharp, dotnet, performance, memory]
order: 9
related: [fundamentals/modern-csharp-language-features, fundamentals/big-o-notation, azure/azure-app-service]
status: needs-review
reviewNotes: New entry in the C#/.NET fundamentals batch.
---

Most C# code never needs to think about memory explicitly — the garbage collector handles it. This entry is for the code that does: hot paths, high-throughput services, and understanding why "allocations" shows up in every performance conversation.

## Value types vs reference types, briefly

`struct` (value type) lives inline — on the stack, or embedded directly in whatever contains it. `class` (reference type) is allocated on the **heap**, and what you hold is a reference to it.

```csharp
struct Point { public int X, Y; }              // copied by value when passed/assigned
class Customer { public string Name = ""; }    // passed/assigned by reference
```

This matters for performance (copying a large struct repeatedly is itself costly — prefer `readonly struct` and pass by `in` for bigger ones) and for correctness (mutating a struct you received by value doesn't change the caller's copy).

## The generational garbage collector

.NET's GC assumes most objects die young (generational hypothesis) and organises the heap accordingly:

- **Gen 0** — new, short-lived objects. Collected frequently and cheaply.
- **Gen 1** — survived one collection; a buffer between short and long-lived.
- **Gen 2** — long-lived objects. Collected rarely, but a full Gen 2 collection is comparatively expensive.
- **Large Object Heap (LOH)** — objects ≥ 85,000 bytes, collected with Gen 2 and historically not compacted (it can be, since .NET Core, if you opt in).

Each collection pauses the affected generation's work briefly. **Fewer, smaller allocations mean fewer, cheaper collections** — this is the entire motivation behind everything else in this entry.

### Server GC vs Workstation GC

| | Workstation GC | Server GC |
| --- | --- | --- |
| **Heaps** | One | One per core |
| **Optimised for** | Low latency, low memory, client apps | Throughput, many cores, server workloads |
| **Default for** | Desktop apps | ASP.NET Core apps (since .NET Core 3.0) |

```xml
<!-- .csproj, when you need to override the default -->
<ServerGarbageCollection>true</ServerGarbageCollection>
<ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
```

Server GC uses more memory (a heap per core) in exchange for higher throughput — rarely worth changing from the default unless you've measured a specific problem.

## `Span<T>` and `Memory<T>`: slicing without copying

`Span<T>` is a **stack-only** (it's a `ref struct`) view over contiguous memory — an array, a string, stack-allocated memory — that lets you slice and process data **without allocating a new array** for each slice:

```csharp
// ❌ Substring allocates a new string every call
string ExtractCode(string input) => input.Substring(0, 3);

// ✅ Span slices the existing memory — no allocation
ReadOnlySpan<char> ExtractCode(ReadOnlySpan<char> input) => input[..3];

// Parsing without intermediate string allocations
ReadOnlySpan<char> line = "42,GBP".AsSpan();
int comma = line.IndexOf(',');
int amount = int.Parse(line[..comma]);
string currency = line[(comma + 1)..].ToString();   // allocate only where you must keep the result
```

Because `Span<T>` can point at stack memory, it **can't** be stored in a class field, boxed, or used across an `await` — for those cases, use `Memory<T>` (a heap-friendly equivalent you can hold onto and get a `Span<T>` from when you actually need to process it).

## `ArrayPool<T>`: reusing buffers

For temporary buffers in hot paths (parsing, serialisation, I/O), **rent** an array instead of allocating a new one each time:

```csharp
var buffer = ArrayPool<byte>.Shared.Rent(4096);
try
{
    var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, 4096));
    Process(buffer.AsSpan(0, bytesRead));
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);   // always return it, even on an exception
}
```

## Boxing: an easy-to-miss allocation

Assigning a value type to an `object` (or a non-generic interface) **boxes** it — a heap allocation wrapping the value:

```csharp
int x = 42;
object boxed = x;              // ❌ allocates — the int is copied onto the heap
Console.WriteLine($"{x}");     // ✅ string interpolation with a value type doesn't box in modern .NET
```

Generic APIs (`List<int>` rather than a non-generic `ArrayList`) avoid this entirely, which is one of the quieter reasons generics matter for performance, not just type safety — see [Generics](generics.md).

```recall
Q: What's the core idea behind the generational garbage collector?
A: Most objects die young, so the heap is split into generations (Gen 0/1/2 + LOH) and younger generations are collected far more often and more cheaply than older ones.

Q: What's the main trade-off between Workstation GC and Server GC?
A: Server GC uses a heap per core for higher throughput at the cost of more memory; Workstation GC uses one heap, favouring lower memory and latency — ASP.NET Core defaults to Server GC.

Q: Why can't a `Span<T>` be stored as a class field or used across an await?
A: It's a ref struct that can point at stack memory, so its lifetime must stay within the current stack frame; use `Memory<T>` when you need to hold onto a buffer reference longer.

Q: What is boxing, and why do generic collections avoid it?
A: Boxing allocates a heap object to wrap a value type when it's assigned to object or a non-generic interface; generic collections like `List<int>` store the value type directly, with no wrapping allocation.
```
