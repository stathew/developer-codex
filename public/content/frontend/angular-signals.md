---
title: Angular Signals
summary: Angular's fine-grained reactivity primitive — signal, computed, effect and resource — and how it enables zoneless change detection.
difficulty: intermediate
tags: [angular, reactivity, typescript, signals]
order: 2
related: [frontend/browser-rendering-pipeline]
---

A **signal** is a wrapper around a value that notifies interested consumers when it changes. Because Angular knows exactly which templates and computations read which signals, it can update precisely what changed — no zone.js, no dirty-checking the whole tree.

## The core primitives

```ts
import { signal, computed, effect } from '@angular/core';

const count = signal(0);                       // writable
const doubled = computed(() => count() * 2);   // derived, read-only, memoised

effect(() => console.log(`count is ${count()}`)); // side effect, re-runs on change

count.set(5);
count.update((c) => c + 1);
```

- **Reading** a signal is a function call: `count()`. That call is how Angular tracks dependencies.
- **`computed`** is lazy and cached — it recalculates only when a dependency changes *and* someone reads it.
- **`effect`** is for syncing with the outside world (logging, `localStorage`, imperative DOM APIs). Don't use it to copy one signal into another — that's what `computed` is for.

> [!WARNING]
> Setting signals inside an `effect` to derive state is the most common signals anti-pattern. It creates extra change-detection passes and makes data flow hard to follow. Reach for `computed` or `linkedSignal` instead.

## Signals in components

```ts
@Component({
  selector: 'app-cart',
  template: `
    <p>{{ items().length }} items — {{ total() | currency }}</p>
    <button (click)="add(product())">Add</button>
  `,
})
export class Cart {
  readonly product = input.required<Product>();    // signal input
  readonly added = output<Product>();

  protected readonly items = signal<Product[]>([]);
  protected readonly total = computed(() => this.items().reduce((s, p) => s + p.price, 0));

  add(p: Product) {
    this.items.update((list) => [...list, p]);
    this.added.emit(p);
  }
}
```

Note the **immutable update**: `update` returns a new array. Mutating in place (`list.push(p)`) wouldn't change the reference, so nothing would be notified.

## Async data with `resource`

`resource` turns an async loader into signals for value, status and error, re-running automatically when its params change:

```ts
readonly userId = input.required<string>();

readonly user = resource({
  params: () => ({ id: this.userId() }),
  loader: ({ params, abortSignal }) =>
    fetch(`/api/users/${params.id}`, { signal: abortSignal }).then((r) => r.json()),
});
// template: @if (user.hasValue()) { {{ user.value().name }} }
```

## Why it matters: zoneless change detection

Historically zone.js patched every async API to tell Angular "something might have changed — check everything". With signals, Angular is told *exactly* what changed. Modern Angular applications run **zoneless** by default, which means smaller bundles, faster updates and simpler stack traces.

```recall
Q: What is the difference between `computed` and `effect`?
A: `computed` derives a new read-only, memoised value from other signals; `effect` runs side effects (talking to non-signal code) when its dependencies change.

Q: Why does `items.update(l => { l.push(x); return l; })` fail to trigger updates?
A: It returns the same array reference, so the signal's equality check sees no change. Return a new array instead.

Q: How does Angular know which signals a template depends on?
A: Reading a signal (calling it) during template or computed evaluation registers it as a dependency of that consumer.
```
