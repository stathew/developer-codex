---
title: Coding Exercises
summary: Classic interview coding problems — FizzBuzz, reversing a linked list, inverting a binary tree — with clean solutions and their complexity.
difficulty: intermediate
tags: [interviews, algorithms, data-structures, javascript]
order: 4
related: [fundamentals/big-o-notation, fundamentals/data-structures, career/technical-interview-questions]
status: needs-review
reviewNotes: Built from the 2023 FizzBuzz.js and Technical Tests notes. Fixed FizzBuzz (the original looped 0–99 instead of 1–100 and used undeclared globals); wrote solutions for the listed "Reverse Linked List" and "Reverse (invert) Binary Tree" problems. The Algorithm Questions note was empty.
---

Interview coding exercises test whether you can **turn a problem into working code while explaining your thinking**. The approach matters as much as the answer:

1. Restate the problem and **ask about edge cases** (empty input? one element? duplicates?).
2. Talk through a simple solution first, then improve it.
3. Write the code, then **trace it with a small example**.
4. State the **time and space complexity**.

## FizzBuzz

Print 1 to 100, but print "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.

```js
for (let i = 1; i <= 100; i++) {
  const fizz = i % 3 === 0;
  const buzz = i % 5 === 0;
  console.log(fizz && buzz ? 'FizzBuzz' : fizz ? 'Fizz' : buzz ? 'Buzz' : i);
}
```

What it checks: loop bounds (1–100, not 0–99), checking the combined case first, and tidy code. **O(n)** time, **O(1)** space.

## Reverse a linked list

Reverse a singly linked list in place.

```ts
interface ListNode { val: number; next: ListNode | null; }

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let current = head;
  while (current) {
    const next = current.next;  // remember the rest of the list
    current.next = prev;        // reverse the pointer
    prev = current;             // step forward
    current = next;
  }
  return prev;                  // prev is the new head
}
```

Trace `1 → 2 → 3` on paper: it's the clearest way to convince yourself, and the interviewer, that it works. **O(n)** time, **O(1)** space. A recursive version is shorter but uses O(n) stack.

## Invert a binary tree

Mirror a binary tree so every node's left and right children swap.

```ts
interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; }

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
```

**O(n)** time, **O(h)** space for the recursion, where *h* is the tree height (O(n) worst case for a skewed tree). Mention the iterative alternative with a queue (BFS) if asked about very deep trees.

## Practising effectively

- Practise **out loud** and against a timer.
- Solve without an AI assistant first — that's the condition you'll interview in.
- Afterwards, turn each pattern you learn (two pointers, sliding window, BFS/DFS, hash-map counting) into a recall card.

```recall
Q: What are the three pointers used to reverse a linked list iteratively?
A: prev (starts null), current (starts at head) and next (saved before re-pointing current.next to prev).

Q: What is the complexity of inverting a binary tree recursively?
A: O(n) time, and O(h) space for the call stack, where h is the tree's height.

Q: What two bugs did the original FizzBuzz loop `for (var i = 0; i < 100; i++)` have?
A: It printed 0 (as FizzBuzz) and never reached 100 — the range should be 1 to 100 inclusive. It also assigned undeclared variables, creating implicit globals.
```
