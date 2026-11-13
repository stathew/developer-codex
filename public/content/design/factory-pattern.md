---
title: Factory Pattern
summary: Centralise object creation so callers ask for "a shape" rather than calling new on a specific class — simple factories, factory methods and abstract factories.
difficulty: beginner
tags: [design-patterns, creational, oop]
order: 11
related: [design/builder-pattern, design/dependency-injection, design/strategy-pattern]
status: needs-review
reviewNotes: Imported from the 2023 Factory note. Kept the intent and the ShapeFactory example idea; added code, the Simple Factory / Factory Method / Abstract Factory distinction and trade-offs.
---

**Type:** creational · **Also known as:** Simple Factory, Factory Method, Abstract Factory (related variants).

**Intent:** abstract away the `new` keyword. Callers ask a factory for an object; the factory decides which concrete class to create. Changing which class gets returned means changing one place, not every caller.

## Example: ShapeFactory

```ts
interface Shape { area(): number; }
class Circle implements Shape { constructor(private r: number) {} area() { return Math.PI * this.r ** 2; } }
class Square implements Shape { constructor(private s: number) {} area() { return this.s ** 2; } }

class ShapeFactory {
  static create(kind: 'circle' | 'square', size: number): Shape {
    switch (kind) {
      case 'circle': return new Circle(size);
      case 'square': return new Square(size);
    }
  }
}

const shape = ShapeFactory.create('circle', 2); // caller only knows about Shape
```

## The three variants

| Variant | What it is |
| --- | --- |
| **Simple factory** | A function/class with a `create` method choosing the concrete type (above). Not a GoF pattern, but the most common. |
| **Factory Method** (GoF) | A base class declares an abstract `createX()`; subclasses override it to decide the concrete product. |
| **Abstract Factory** (GoF) | An interface for creating *families* of related objects (e.g. `WindowsUiFactory` / `MacUiFactory` each make matching buttons and menus). |

## When to use it

- Creation logic is non-trivial (configuration, caching, validation).
- The concrete type depends on runtime input (file extension, user settings).
- You want callers decoupled from concrete classes.

## When not to

If the choice is static, a DI container already does this for you. A factory wrapping a single `new` adds indirection for nothing.

```recall
Q: What problem does the factory pattern solve?
A: It centralises object creation so callers depend on an abstraction rather than calling `new` on concrete classes, making the concrete type easy to change.

Q: How does Abstract Factory differ from Factory Method?
A: Factory Method lets subclasses decide one product type; Abstract Factory provides an interface for creating families of related products.
```
