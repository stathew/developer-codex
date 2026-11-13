---
title: Design Patterns Overview
summary: What design patterns are, the three classic families (creational, structural, behavioural), and a map of every pattern in the codex.
difficulty: beginner
tags: [design-patterns, oop, architecture]
order: 9
related: [design/solid-principles, design/object-oriented-programming]
status: needs-review
reviewNotes: New hub entry linking the pattern entries, organised by the GoF families.
---

A **design pattern** is a named, reusable solution to a problem that keeps recurring in software design. Patterns aren't code to copy; they're a **shared vocabulary**. Saying "wrap it in an adapter" communicates a whole design in three words.

The classic catalogue is *Design Patterns: Elements of Reusable Object-Oriented Software* (1994) by Gamma, Helm, Johnson and Vlissides, the "Gang of Four" (GoF). It describes 23 patterns in three families.

## Creational: how objects get made

| Pattern | In one line |
| --- | --- |
| [Factory](factory-pattern.md) | Centralise object creation so callers don't call `new` on concrete classes |
| [Builder](builder-pattern.md) | Build complex objects step by step with a fluent API |
| [Singleton](singleton-pattern.md) | Exactly one instance with a global access point (prefer a DI singleton lifetime) |

## Structural: how objects are composed

| Pattern | In one line |
| --- | --- |
| [Adapter](adapter-pattern.md) | Make an incompatible interface fit the one you expect |
| [Decorator](decorator-pattern.md) | Add behaviour by wrapping an object with the same interface |
| [Proxy](proxy-pattern.md) | Control access to an object via a stand-in with the same interface |

## Behavioural: how objects collaborate

| Pattern | In one line |
| --- | --- |
| [Strategy](strategy-pattern.md) | Swap interchangeable algorithms at runtime |
| [Observer](observer-pattern.md) | Notify subscribers automatically when something changes |
| [Template Method](template-method-pattern.md) | Fixed algorithm skeleton with overridable steps |
| [Rules](rules-pattern.md) | Independent business-rule classes evaluated by a small engine (not GoF) |

## Architectural patterns

These operate at a larger scale than the GoF patterns:

- [Model–View–Controller](model-view-controller.md): separate data, presentation and input handling.
- [Repository](repository-pattern.md): a collection-like abstraction over data storage.
- [Dependency Injection](dependency-injection.md): supply dependencies from outside.
- [API Gateway](../backend/api-gateway.md): a single entry point in front of many services.

## Using patterns well

- **Start from the problem, not the pattern.** Reach for a pattern when you recognise the problem it solves, not to make code look sophisticated.
- **Many patterns are built into your language or framework.** First-class functions replace many Strategy and Command classes; DI containers replace hand-written factories and singletons; `IEnumerable`/iterators are the Iterator pattern.
- **Prefer composition.** Several GoF patterns (Strategy, Decorator) exist to avoid inheritance hierarchies.

> [!AI]
> AI assistants know every pattern's textbook shape and will happily apply one where a plain function would do. When generated code introduces interfaces, factories and abstract base classes, ask what concrete problem each one solves here.

```recall
Q: What are the three families of GoF design patterns?
A: Creational (object creation), structural (object composition) and behavioural (object collaboration and responsibilities).

Q: Who are the "Gang of Four"?
A: Erich Gamma, Richard Helm, Ralph Johnson and John Vlissides, authors of the 1994 book Design Patterns.

Q: What's the main value of design patterns beyond the code itself?
A: A shared vocabulary for communicating design ideas concisely.
```
