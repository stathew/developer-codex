---
title: Core Data Structures
summary: Arrays, linked lists, hash maps, stacks, queues, trees and heaps — what each is good at, and how to choose between them.
difficulty: beginner
tags: [data-structures, algorithms, complexity]
order: 2
related: [fundamentals/big-o-notation, databases/indexes]
---

Choosing a data structure is choosing which operations will be cheap. Most performance problems in application code are a structure mismatch, not a slow language.

## At a glance

| Structure | Access | Search | Insert | Delete | Good for |
| --- | --- | --- | --- | --- | --- |
| Array / list | `O(1)` | `O(n)` | `O(n)`* | `O(n)` | Ordered data, iteration, index access |
| Hash map | — | `O(1)` avg | `O(1)` avg | `O(1)` avg | Lookup by key, de-duplication, counting |
| Linked list | `O(n)` | `O(n)` | `O(1)`† | `O(1)`† | Frequent insert/remove at known positions |
| Stack | top `O(1)` | — | `O(1)` | `O(1)` | Undo, parsing, DFS, call stacks |
| Queue | front `O(1)` | — | `O(1)` | `O(1)` | Scheduling, BFS, buffering |
| Balanced BST | — | `O(log n)` | `O(log n)` | `O(log n)` | Sorted data with fast lookup, range queries |
| Heap | min/max `O(1)` | `O(n)` | `O(log n)` | `O(log n)` | Priority queues, top-k |

\* Appending to the end of a dynamic array is amortised `O(1)`. † Given a reference to the node.

## Arrays

Contiguous memory makes arrays extremely cache-friendly — iterating an array is often faster than its Big-O peers suggest. Inserting at the front shifts every element.

## Hash maps

A hash function maps keys to buckets, giving average `O(1)` operations. In JavaScript, prefer `Map`/`Set` over plain objects when keys are dynamic.

```ts
// Counting occurrences in O(n)
const counts = new Map<string, number>();
for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
```

## Stacks and queues

Both restrict access to make reasoning simple: stacks are **LIFO** (last in, first out), queues are **FIFO**. Note that `Array.shift()` in JavaScript is `O(n)` — for large queues use a ring buffer or two-stack queue.

## Trees

A **binary search tree** keeps keys ordered so lookup is `O(log n)` — *if balanced*. Self-balancing variants (red-black, AVL) guarantee it. Database indexes use a close relative, the **B-tree**, which is wide and shallow to minimise disk reads. See [Database Indexes](../databases/indexes.md).

## Heaps

A heap keeps the smallest (or largest) item at the top with `O(log n)` insert and remove. Perfect for "process the most urgent job next" or "find the top 10 of a million".

```recall
Q: Why is iterating an array often faster in practice than a linked list, even with the same Big-O?
A: Arrays are contiguous in memory, so they're far more CPU-cache-friendly.

Q: Which structure would you use for "always process the highest-priority job next"?
A: A heap (priority queue): O(1) peek, O(log n) insert and remove.

Q: What's the complexity of `Array.prototype.shift()` in JavaScript, and why does it matter?
A: O(n) — every element is re-indexed — so using arrays as large queues becomes quadratic.
```
