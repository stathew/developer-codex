---
title: Algorithm Questions
summary: The recurring patterns behind most interview algorithm problems — hash maps, two pointers, sliding window, binary search, BFS/DFS, heaps and dynamic programming.
difficulty: intermediate
tags: [interviews, algorithms, data-structures, career]
order: 5
related: [career/coding-exercises, fundamentals/big-o-notation, fundamentals/data-structures]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Algorithm Questions stub (no content).
---

Most interview algorithm questions are variations on a **small set of patterns**. Recognising the pattern is most of the work; the code follows. Practise identifying *which* pattern fits, and state the [complexity](../fundamentals/big-o-notation.md) every time.

## Pattern cheat sheet

| Signal in the problem | Pattern to try |
| --- | --- |
| "Have we seen this before?", counting, pairs that sum to X | Hash map / set |
| Sorted array, pairs, palindromes, in-place rearranging | Two pointers |
| "Longest/shortest contiguous subarray or substring with…" | Sliding window |
| Sorted input, "find the first/last that…", minimising a maximum | Binary search |
| Trees, grids, "number of islands", shortest path (unweighted) | BFS / DFS |
| "Top k", "k-th largest", merging sorted lists | Heap |
| "Number of ways", "min/max cost", overlapping subproblems | Dynamic programming |
| All combinations, permutations or subsets | Backtracking |

## Hash map: Two Sum

Find two numbers that add up to a target.

```ts
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();            // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return null;
}
```

**O(n)** time, O(n) space, versus O(n²) for checking every pair.

## Two pointers: is it a palindrome?

```ts
function isPalindrome(s: string): boolean {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let l = 0, r = t.length - 1; l < r; l++, r--) {
    if (t[l] !== t[r]) return false;
  }
  return true;
}
```

## Sliding window: longest substring without repeats

```ts
function longestUnique(s: string): number {
  const lastSeen = new Map<string, number>();
  let start = 0, best = 0;
  for (let end = 0; end < s.length; end++) {
    const prev = lastSeen.get(s[end]);
    if (prev !== undefined && prev >= start) start = prev + 1;   // shrink past the duplicate
    lastSeen.set(s[end], end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
```

**O(n):** each character enters and leaves the window at most once.

## Binary search

```ts
function search(sorted: number[], target: number): number {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);     // avoids overflow in fixed-width languages
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
```

**O(log n).** Binary search also works on an *answer space*: "what's the smallest capacity that ships everything in D days?"

## BFS on a grid: number of islands

```ts
function countIslands(grid: string[][]): number {
  let islands = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== '1') continue;
      islands++;
      const queue: [number, number][] = [[r, c]];
      grid[r][c] = '0';                                   // mark visited
      while (queue.length) {
        const [y, x] = queue.shift()!;
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx;
          if (grid[ny]?.[nx] === '1') { grid[ny][nx] = '0'; queue.push([ny, nx]); }
        }
      }
    }
  }
  return islands;
}
```

**O(rows × cols).** BFS finds shortest paths in unweighted graphs; DFS (recursion or a stack) is simpler for exploring and backtracking.

## Dynamic programming: climbing stairs

How many ways are there to climb *n* steps taking 1 or 2 at a time? `ways(n) = ways(n-1) + ways(n-2)`.

```ts
function climbStairs(n: number): number {
  let [a, b] = [1, 1];                     // ways(0), ways(1)
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
```

The DP recipe:

1. Define the state.
2. Write the recurrence.
3. Identify the base cases.
4. Choose memoisation (top-down) or tabulation (bottom-up).
5. Reduce space if only the last few states matter.

## Practising

- Group practice **by pattern**, then mix patterns to practise recognising them.
- After solving, write down the *signal* that pointed to the pattern, and make it a recall card.
- See [Coding Exercises](coding-exercises.md) for interview technique: clarify, talk through, trace, analyse.

```recall
Q: What pattern does "longest substring/subarray satisfying a condition" suggest?
A: Sliding window — expand the right edge, shrink the left edge when the condition breaks; O(n).

Q: How do you solve Two Sum in O(n)?
A: One pass with a hash map from value to index, checking whether target − current has been seen.

Q: When should you prefer BFS over DFS?
A: When you need the shortest path (fewest steps) in an unweighted graph or grid.

Q: What are the steps for approaching a dynamic programming problem?
A: Define the state, write the recurrence, set base cases, choose memoisation or tabulation, then optimise space if possible.

Q: Besides searching a sorted array, what else can binary search be used for?
A: Searching an answer space — finding the minimum/maximum value that satisfies a monotonic condition.
```
