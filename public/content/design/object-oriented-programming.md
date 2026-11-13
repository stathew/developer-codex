---
title: Object-Oriented Programming
summary: The four pillars — encapsulation, abstraction, inheritance and polymorphism — plus abstract classes vs interfaces and when to prefer composition.
difficulty: beginner
tags: [oop, csharp, java, typescript, design]
order: 1
related: [design/solid-principles, design/dependency-injection, career/technical-interview-questions]
status: needs-review
reviewNotes: Imported from the 2023 OOP note. Rewrote encapsulation and abstraction (the originals described them inaccurately), kept the Animal/Speak polymorphism example, filled the empty Classes/Methods sections, and updated abstract class vs interface for C# 8+ / Java 8+ default interface methods.
---

Object-oriented programming (OOP) organises code around **objects**: bundles of state (fields) and the behaviour (methods) that operates on it. Most mainstream languages — C#, Java, TypeScript, Python, Kotlin — support it.

## The four pillars

### Encapsulation

Keep an object's internal state private and expose only the operations that keep it valid. Callers can't put the object into an inconsistent state because they can't reach its internals.

```csharp
public class BankAccount
{
    private decimal _balance;               // hidden state

    public decimal Balance => _balance;     // read-only view

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (amount > _balance) throw new InvalidOperationException("Insufficient funds");
        _balance -= amount;                 // the only way the balance changes
    }
}
```

### Abstraction

Expose *what* something does and hide *how*. A `PaymentGateway.Charge(amount)` method hides HTTP calls, retries and provider quirks. Encapsulation protects state; abstraction simplifies the mental model.

### Inheritance

A subclass reuses and extends a base (super) class, forming an "is-a" relationship: a `Cat` *is an* `Animal`.

> [!WARNING]
> Deep inheritance hierarchies are brittle — a change to a base class ripples into every subclass. Prefer **composition** ("has-a") unless there's a genuine is-a relationship and shared behaviour.

### Polymorphism

"Many forms": the same call behaves differently depending on the object's runtime type.

```csharp
abstract class Animal { public abstract string Speak(); }
class Pig : Animal { public override string Speak() => "Oink"; }
class Cat : Animal { public override string Speak() => "Meow"; }

foreach (Animal a in new Animal[] { new Pig(), new Cat() })
    Console.WriteLine(a.Speak());   // Oink, Meow — chosen at runtime
```

This is **subtype (runtime) polymorphism**. **Overloading** — same method name, different parameter lists — is resolved at compile time and is sometimes called *ad-hoc polymorphism*. Generics provide *parametric polymorphism*.

## Classes and members

- **Public** members form the class's contract with the outside world; **private** members are implementation details you can change freely.
- **Static** members belong to the type rather than an instance (`Math.Max`).
- **Virtual** methods have a default implementation that subclasses *may* override; **abstract** methods have none and *must* be overridden.

## Abstract classes vs interfaces

| | Abstract class | Interface |
| --- | --- | --- |
| Instantiable | No | No |
| State (fields) | Yes | No instance state |
| Constructors | Yes | No |
| Inheritance | Single base class | A class can implement many |
| Default method bodies | Yes | Yes, since C# 8 / Java 8 |
| Models | "is-a" with shared implementation | "can-do" capability/contract |

> [!NOTE]
> The classic answer "abstract classes can have implementations, interfaces can't" is outdated — modern C# and Java allow default interface methods. The more durable distinctions are **state**, **constructors** and **single vs multiple inheritance**.

```recall
Q: What's the difference between encapsulation and abstraction?
A: Encapsulation hides and protects an object's internal state so it can only change through valid operations; abstraction hides implementation complexity behind a simpler interface describing *what* rather than *how*.

Q: What is runtime (subtype) polymorphism?
A: Calling a method through a base-type reference and having the overriding implementation of the actual runtime type execute.

Q: Give two durable differences between abstract classes and interfaces in C#/Java.
A: Abstract classes can hold instance state and constructors; a class can extend only one abstract class but implement many interfaces.

Q: Why is "favour composition over inheritance" common advice?
A: Inheritance couples subclasses tightly to base-class internals, making hierarchies brittle; composition combines small objects with clear interfaces and is easier to change.
```
