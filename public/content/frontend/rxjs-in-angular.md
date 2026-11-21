---
title: RxJS in Angular
summary: Choosing the right flattening operator, Subjects, the async pipe, and unsubscribing safely with takeUntilDestroyed — RxJS as Angular actually uses it.
difficulty: intermediate
tags: [angular, rxjs, typescript]
order: 9
related: [frontend/angular, frontend/angular-signals, fundamentals/dotnet-async-streams-and-tasks]
status: needs-review
reviewNotes: New entry opening the Angular-depth batch. takeUntilDestroyed's stable-since-v19 status checked fresh against angular.dev on 2026-11-21.
---

[Angular](angular.md) covers *when* to reach for a signal vs an observable. This entry is RxJS itself, as Angular actually uses it: HTTP, the router, and genuinely asynchronous streams.

## The flattening operators: the classic interview question

All four take a source observable that emits **other observables** (e.g. a search term triggering an HTTP call per keystroke) and flatten them into one stream — they differ only in how they handle **overlap**.

```ts
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term)),   // cancels the previous search if a new term arrives
).subscribe(results => this.results.set(results));
```

| Operator | On a new source value while the last is still running | Use for |
| --- | --- | --- |
| `switchMap` | **Cancels** the previous inner observable, switches to the new one | Search-as-you-type, route params — only the latest result matters |
| `mergeMap` | Runs **all** of them concurrently, merges results as they arrive | Independent parallel requests where order/overlap doesn't matter |
| `concatMap` | **Queues** — waits for the current one to finish before starting the next | Must preserve order (sequential saves, one after another) |
| `exhaustMap` | **Ignores** new values while one is in flight | Submit buttons — ignore repeat clicks instead of queuing or cancelling |

> [!TIP]
> Getting this choice wrong is a common, subtle bug: `mergeMap` on a save-button click can fire the save twice if clicked twice quickly; `switchMap` on it would cancel the first save entirely. `exhaustMap` is almost always what a submit button actually wants.

## Subjects: a stream you push into yourself

| Type | Starts with | New subscribers get |
| --- | --- | --- |
| `Subject<T>` | Nothing | Only values emitted *after* they subscribe |
| `BehaviorSubject<T>` | A required initial value | The **current** value immediately, then future ones |
| `ReplaySubject<T>` | Nothing | The last *n* buffered values, then future ones |

```ts
private readonly basketItems = new BehaviorSubject<Product[]>([]);
readonly items$ = this.basketItems.asObservable();   // expose as Observable, not the mutable Subject

addItem(product: Product) {
  this.basketItems.next([...this.basketItems.value, product]);
}
```

> [!NOTE]
> A **signal** (see [Angular Signals](angular-signals.md)) replaces most of what a `BehaviorSubject` was used for in services — it's simpler for synchronous state with a current value. Keep Subjects for genuine event streams and async combination logic.

## The async pipe: let the template manage subscriptions

```html
<ul>
  @for (item of items$ | async; track item.id) {
    <li>{{ item.name }}</li>
  }
</ul>
```

`| async` subscribes when the template is created and **unsubscribes automatically** when the component is destroyed — for most display-only cases, you never call `.subscribe()` by hand at all.

## Unsubscribing when you must subscribe manually

For subscriptions with side effects (not just rendering), leaking them is the classic Angular memory leak: the observable keeps the component alive, and the subscription keeps running after the component is gone.

```ts
export class BasketSummary {
  private readonly destroyRef = inject(DestroyRef);

  constructor(private basket: BasketService) {
    this.basket.items$
      .pipe(takeUntilDestroyed(this.destroyRef))   // stable since Angular v19; inferred automatically in an injection context
      .subscribe(items => this.sendAnalyticsEvent(items));
  }
}
```

`takeUntilDestroyed()` replaces the older pattern of a manual `destroy$ = new Subject<void>()` plus `takeUntil(this.destroy$)` plus emitting it in `ngOnDestroy` — called inside a constructor or field initialiser (an **injection context**), it doesn't even need the `DestroyRef` argument explicitly.

## Bridging to and from signals

```ts
readonly searchResults = toSignal(this.api.search(term), { initialValue: [] });   // observable → signal
readonly searchTerm$ = toObservable(this.searchTermSignal);                        // signal → observable, to feed into RxJS operators
```

```recall
Q: What's the difference between switchMap and mergeMap when a new source value arrives while the previous inner observable is still running?
A: switchMap cancels the previous inner observable and switches to the new one; mergeMap lets both run concurrently and merges their results.

Q: Which flattening operator usually fits a submit button, and why?
A: exhaustMap — it ignores new clicks while a submission is already in flight, rather than queuing (concatMap) or cancelling (switchMap) it.

Q: What does a BehaviorSubject give new subscribers that a plain Subject doesn't?
A: Its current value immediately on subscription, since it requires and always holds one; a plain Subject only emits values that occur after you subscribe.

Q: Why does the async pipe help avoid memory leaks?
A: It subscribes when the template is created and automatically unsubscribes when the component is destroyed, so you don't need to manage that subscription by hand.
```
