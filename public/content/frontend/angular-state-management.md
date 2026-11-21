---
title: "Angular State Management: Signals, SignalStore & NgRx"
summary: A decision framework for component-local signals, NgRx SignalStore for shared feature state, and classic NgRx for complex, audited app-wide workflows.
difficulty: advanced
tags: [angular, signals, state-management]
order: 12
related: [frontend/angular-signals, frontend/rxjs-in-angular, design/domain-driven-design]
status: needs-review
reviewNotes: New entry closing the Angular-depth batch. The "signals for local, SignalStore for feature, classic NgRx for complex app-wide" framing reflects current (2026) community and NgRx-team guidance, checked fresh on 2026-11-21.
---

Angular's state-management options form a ladder of increasing structure. Most applications should climb only as far as they actually need.

## Rung 1: plain signals in a service

For state shared by a feature but without complex cross-cutting workflow, an injectable service holding signals (the pattern already shown in [Angular](angular.md)) is often simply enough:

```ts
@Injectable({ providedIn: 'root' })
export class BasketService {
  private readonly _items = signal<Product[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((sum, p) => sum + p.price, 0));

  add(product: Product) { this._items.update(items => [...items, product]); }
}
```

No library, no boilerplate, full signal integration everywhere. The limitation: no conventions for async loading state, no devtools, and it's on you to keep it tidy as it grows.

## Rung 2: NgRx SignalStore

**SignalStore** is NgRx's signals-native store — structured state management without Redux's actions/reducers ceremony, and the common **default choice for new feature-level state** in current Angular apps:

```ts
export const BasketStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as Product[], loading: false }),
  withComputed(({ items }) => ({
    total: computed(() => items().reduce((sum, p) => sum + p.price, 0)),
  })),
  withMethods((store, api = inject(BasketApi)) => ({
    async load() {
      patchState(store, { loading: true });
      const items = await api.getBasket();
      patchState(store, { items, loading: false });
    },
  })),
);
```

`withState`, `withComputed` and `withMethods` compose a store from small pieces; `patchState` updates it immutably. This gives you structure and testability closer to NgRx, with far less boilerplate, and it reads and writes through ordinary signals — no `async` pipe needed in templates.

## Rung 3: classic NgRx (Store/Actions/Effects)

Reach for the full Redux-style **NgRx Store** when state is genuinely **app-wide**, changes through many different triggers, and benefits from an explicit, auditable event log:

```ts
export const orderPlaced = createAction('[Checkout] Order Placed', props<{ order: Order }>());

export const ordersReducer = createReducer(
  initialState,
  on(orderPlaced, (state, { order }) => ({ ...state, orders: [...state.orders, order] })),
);

@Injectable()
export class OrderEffects {
  placeOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(orderPlaced),
      exhaustMap(({ order }) => this.api.submit(order).pipe(map(() => orderConfirmed({ order })))),
    ),
  );
}
```

The benefit: every state change is an explicit, named **action**, replayable and debuggable with Redux DevTools, and effects cleanly separate side effects (API calls) from pure state transitions (reducers). The cost: considerably more files and ceremony per feature than the alternatives above.

## Choosing

| State scope | Reach for |
| --- | --- |
| One component, or a small group that shares a parent | Plain signals (`signal`, `computed`) directly in the component |
| One feature's shared state (a basket, a wizard's steps) | NgRx SignalStore |
| App-wide state with complex, auditable workflows across many features | Classic NgRx (Store/Actions/Effects) |
| Server data (API responses) specifically | A data-fetching library (TanStack Query for Angular, or Angular's own `httpResource`/`resource`) rather than hand-rolling cache invalidation in any of the above |

> [!TIP]
> It's entirely normal for one app to use more than one rung at once: SignalStore for most features, classic NgRx for one genuinely complex cross-feature workflow (like checkout), and plain signals everywhere else. Don't adopt NgRx app-wide just because one screen needs it.

> [!AI]
> AI assistants trained on older Angular content default to suggesting classic NgRx (or even `BehaviorSubject`-based "facade services") for state that a few signals in a service would handle fine. Ask "does this state actually need to be this structured?" before accepting the suggestion.

```recall
Q: What is NgRx SignalStore, and why has it become the default for new feature-level state?
A: NgRx's signals-native store, built from composable withState/withComputed/withMethods pieces; it gives structure similar to classic NgRx with far less boilerplate and reads/writes through ordinary signals.

Q: When would you still reach for classic NgRx (Store/Actions/Effects) over SignalStore?
A: For app-wide state with complex workflows across many features, where an explicit, replayable action log and strict separation of effects from reducers earns back its extra ceremony.

Q: Where should server/API data usually live, rather than being hand-managed in a signal store?
A: In a data-fetching library's cache (TanStack Query for Angular, or Angular's resource/httpResource), which handles caching, loading and error state for you.
```
