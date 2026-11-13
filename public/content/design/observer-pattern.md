---
title: Observer Pattern
summary: Let objects subscribe to changes in another object and be notified automatically — the idea behind events, RxJS observables and signals.
difficulty: intermediate
tags: [design-patterns, behavioral, events, rxjs, reactive]
order: 17
related: [frontend/angular-signals, backend/webhooks, design/strategy-pattern]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Observer/Observable stub (title only). Covers both the classic pattern and the Observable (RxJS) form the original title referred to.
---

**Type:** behavioural · **Also known as:** Publish–Subscribe (a close relative), Listener, Event.

**Intent:** define a one-to-many dependency so that when one object (the **subject**) changes state, all its **observers** are notified automatically — without the subject knowing who they are.

## The classic form

```ts
type Listener<T> = (value: T) => void;

class Subject<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);   // unsubscribe function
  }

  notify(value: T): void {
    for (const listener of this.listeners) listener(value);
  }
}

const priceChanged = new Subject<number>();
const stop = priceChanged.subscribe((p) => console.log(`New price: ${p}`));
priceChanged.notify(42);   // "New price: 42"
stop();                    // stop listening
```

The subject depends only on the listener *shape*, not on concrete observers — they can be added and removed freely.

## Where you've seen it

- **DOM events:** `button.addEventListener('click', handler)`.
- **C# events:** `public event EventHandler<OrderPlaced>? OrderPlaced;`.
- **RxJS observables:** streams of values over time with operators (`map`, `filter`, `debounceTime`). Angular's `HttpClient` and router events are observables.
- **Signals:** Angular, Solid and Preact signals are a fine-grained, automatically-subscribed variation. Reading a signal registers interest; see [Angular Signals](../frontend/angular-signals.md).

## Observer vs publish–subscribe

In the classic Observer, observers subscribe **directly to the subject**. In **pub/sub**, publishers and subscribers communicate through a **broker or event bus** (Kafka, RabbitMQ, an in-process mediator) and don't know about each other at all. That's looser coupling at the cost of more infrastructure.

## Pitfalls

> [!WARNING]
> **Forgotten subscriptions leak memory.** A subject holds references to its observers, keeping them, and everything they reference, alive. Always unsubscribe: dispose handles, `takeUntilDestroyed()` in Angular, `-=` for C# events.

- **Unexpected ordering** — don't rely on the order observers are notified.
- **Cascades** — an observer that triggers more notifications can cause hard-to-follow chains or infinite loops.
- **Error isolation** — decide whether one failing observer should stop the others.

```recall
Q: What is the intent of the Observer pattern?
A: A one-to-many dependency where a subject notifies all subscribed observers automatically when its state changes, without knowing their concrete types.

Q: How does Observer differ from publish–subscribe?
A: Observers subscribe directly to the subject; in pub/sub, publishers and subscribers are decoupled through a broker or event bus and don't know about each other.

Q: What's the most common bug when using observers?
A: Forgetting to unsubscribe, which leaks memory because the subject keeps references to the observers alive.
```
