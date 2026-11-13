---
title: Generics
summary: Writing type-safe code that works with many types — type parameters, constraints, variance, and how C#, Java and TypeScript implement generics differently.
difficulty: intermediate
tags: [generics, types, csharp, java, typescript]
order: 4
related: [design/object-oriented-programming, design/repository-pattern, fundamentals/data-structures]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Generics stub (no content).
---

**Generics** let you write classes, interfaces and functions that work with **many types** while keeping full **type safety**. Instead of writing `IntList`, `StringList` and `OrderList`, or a `List` of `object` that needs casting, you write `List<T>` once and the compiler checks every use.

## Type parameters

```csharp
public class Box<T>                 // T is a type parameter
{
    public T Value { get; }
    public Box(T value) => Value = value;
}

var a = new Box<int>(42);          // T = int
var b = new Box<string>("hi");     // T = string
int n = a.Value;                   // no cast needed; the compiler knows it's an int
```

**Generic methods** have their own type parameters, and the compiler usually infers them:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);        // T inferred as number
const s = first(['a', 'b']);       // T inferred as string
```

## Constraints

Constraints restrict which types are allowed, which lets you use their members:

```csharp
public static T Max<T>(T a, T b) where T : IComparable<T> =>
    a.CompareTo(b) >= 0 ? a : b;

public class Repository<TEntity> where TEntity : class, IEntity, new() { /* … */ }
```

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {   // K must be a key of T
  return obj[key];
}
```

```java
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
```

## Variance

Can an `IEnumerable<Cat>` be used where an `IEnumerable<Animal>` is expected? That's **variance**:

- **Covariance** (`out` in C#, `? extends` in Java): you can use a more specific type when you only **read** values. `IEnumerable<out T>` means a sequence of cats *is* a sequence of animals.
- **Contravariance** (`in` in C#, `? super` in Java): you can use a more general type when you only **consume** values. An `Action<Animal>` can be used as an `Action<Cat>`.
- **Invariance:** read-write types such as `List<T>` are neither. A `List<Cat>` isn't a `List<Animal>`, or you could add a dog to it.

Java's rule of thumb is **PECS**: *Producer Extends, Consumer Super*.

## How languages implement generics

| Language | Approach | Consequence |
| --- | --- | --- |
| **C#** | **Reified:** generic type information exists at runtime | `typeof(T)` works; value types get specialised code with no boxing |
| **Java** | **Type erasure:** generics are compile-time only | No `new T()` or `T.class`; `List<int>` isn't allowed (use `List<Integer>`) |
| **TypeScript** | **Compile-time only:** all types are erased to JavaScript | Generics give safety and tooling, with no runtime presence |

## Using generics well

- Reach for generics when the **logic is the same** across types (collections, caching, result wrappers, repositories).
- Name type parameters meaningfully when there's more than one: `TKey, TValue`, not `T, U`.
- Don't over-generalise. A generic type with five parameters and complex constraints is often harder to understand than two concrete classes.

```recall
Q: What problem do generics solve?
A: Writing reusable code that works across many types while keeping compile-time type safety, avoiding duplication and unsafe casts.

Q: What is a generic constraint?
A: A restriction on a type parameter (e.g. `where T : IComparable<T>` or `T extends { length: number }`) that limits allowed types and lets the code use their members.

Q: What's the difference between C# and Java generics at runtime?
A: C# generics are reified (type information exists at runtime); Java uses type erasure, so generic type arguments aren't available at runtime.

Q: Why isn't List<Cat> assignable to List<Animal>?
A: List is read-write (invariant); if it were allowed, you could add a Dog to a list that must only contain cats.

Q: What does PECS stand for?
A: Producer Extends, Consumer Super — Java's rule for choosing `? extends` vs `? super` wildcards.
```
