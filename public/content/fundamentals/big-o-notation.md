---
title: Big-O Notation
summary: How to describe the way an algorithm's cost grows with its input — and spot the accidental quadratic before it reaches production.
difficulty: beginner
tags: [algorithms, complexity, performance]
order: 1
related: [fundamentals/complexity-explorer, fundamentals/data-structures, fundamentals/sorting-visualizer]
---

Big-O describes how the **work** (time) or **memory** (space) an algorithm needs **grows** as its input grows. It ignores constants and lower-order terms because, at scale, the growth rate dominates everything else.

## The common classes

| Notation | Name | Example | n = 1,000,000 |
| --- | --- | --- | --- |
| `O(1)` | Constant | Array index, hash map lookup | 1 step |
| `O(log n)` | Logarithmic | Binary search, balanced-tree lookup | ~20 steps |
| `O(n)` | Linear | Scanning a list | 1M steps |
| `O(n log n)` | Linearithmic | Efficient sorts (merge, heap, Timsort) | ~20M steps |
| `O(n²)` | Quadratic | Nested loops over the same data | 10¹² steps |
| `O(2ⁿ)` | Exponential | Naive recursive subset search | heat death of the universe |

> [!TIP]
> Get a feel for these curves in the interactive [Complexity Explorer](complexity-explorer.html).

## Reading complexity from code

### Sequential steps add; nested steps multiply

```ts
function summarise(items: number[]) {
  const total = items.reduce((a, b) => a + b, 0); // O(n)
  const max = Math.max(...items);                 // O(n)
  return { total, max };                          // O(n) + O(n) = O(n)
}

function hasDuplicate(items: number[]) {
  for (let i = 0; i < items.length; i++)          // n ×
    for (let j = i + 1; j < items.length; j++)    // n
      if (items[i] === items[j]) return true;     // = O(n²)
  return false;
}
```

### Hidden loops

The most common accidental quadratic is a linear operation **inside** a loop:

```ts
// O(n²): Array.includes is a linear scan, executed n times
const unique = items.filter((x, i) => !items.slice(0, i).includes(x));

// O(n): a Set gives O(1) average membership checks
const unique2 = [...new Set(items)];
```

Watch for `includes`, `indexOf`, `find`, `splice`, string concatenation in loops, and — on the backend — **a database query inside a loop** (the N+1 problem).

> [!AI]
> Generated code frequently reaches for `array.find` inside `array.map`. It reads beautifully and is fine for 50 items — and quadratic for 50,000. Ask "how big can this collection get?" every time.

## Best, average and worst case

Big-O usually states the **worst case**. Some structures differ a lot between cases:

- **Hash map lookup** — `O(1)` average, `O(n)` worst case (everything collides).
- **Quicksort** — `O(n log n)` average, `O(n²)` worst case (bad pivots).
- **Dynamic array push** — `O(1)` *amortised*: occasional `O(n)` resizes averaged over many pushes.

## Space complexity

The same notation describes memory. Recursion uses stack space proportional to its depth; building a lookup map trades `O(n)` memory for faster time — usually a good deal.

## Recall

```recall
Q: What does Big-O notation describe?
A: How an algorithm's time or space requirements grow as the input size grows, ignoring constants and lower-order terms.

Q: What is the complexity of calling `array.includes` inside a loop over the same array?
A: O(n²) — a linear scan executed n times.

Q: What does "amortised O(1)" mean for a dynamic array push?
A: Most pushes are O(1); occasional resizes cost O(n), but averaged over many operations the cost per push is constant.

Q: Roughly how many steps does binary search need for 1,000,000 items?
A: About 20 (log₂ 1,000,000 ≈ 20).
```
