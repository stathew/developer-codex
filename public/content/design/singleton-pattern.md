---
title: Singleton Pattern
summary: Guaranteeing exactly one instance of a class — how to implement it safely, why it's often considered an anti-pattern, and the DI-friendly alternative.
difficulty: beginner
tags: [design-patterns, creational, oop, csharp]
order: 12
related: [design/dependency-injection, design/factory-pattern]
status: needs-review
reviewNotes: Imported from the 2023 Singleton note. Kept the intent and GameState example; added a thread-safe implementation, drawbacks and the DI singleton-lifetime alternative.
---

**Type:** creational.

**Intent:** ensure a class has **only one instance** and provide a global access point to it.

**Motivation:** some things are genuinely single per process — a game's `GameState`, a configuration snapshot, a connection pool.

## Implementation (C#)

```csharp
public sealed class GameState
{
    private static readonly Lazy<GameState> _instance = new(() => new GameState());
    public static GameState Instance => _instance.Value;   // thread-safe, created on first use

    private GameState() { }                                 // nobody else can construct it

    public int Score { get; set; }
    public int Level { get; set; } = 1;
}

GameState.Instance.Score += 10;
```

`Lazy<T>` handles thread-safe lazy creation; hand-rolled double-checked locking is easy to get wrong.

## Why it's controversial

- **Hidden global state** — any code can read or mutate it, so dependencies aren't visible in constructors.
- **Hard to test** — tests share the instance and can't easily substitute a fake.
- **Couples** callers to a concrete class.

## The modern alternative: a singleton *lifetime*

Let the DI container ensure one instance, while classes receive it like any other dependency:

```csharp
builder.Services.AddSingleton<IGameState, GameState>();

public class ScoreController(IGameState state) { /* … */ }   // explicit and mockable
```

You keep "only one" without the global access point.

```recall
Q: What two guarantees does the Singleton pattern provide?
A: Exactly one instance of the class exists, and there is a global access point to it.

Q: Name two drawbacks of the classic Singleton.
A: It introduces hidden global state, and it makes testing hard because the instance can't easily be replaced with a fake (it also couples callers to a concrete class).

Q: What's the DI-friendly alternative to a static singleton?
A: Register the class with a singleton lifetime in the DI container and inject it via an interface.
```
