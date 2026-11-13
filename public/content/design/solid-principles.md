---
title: SOLID Principles
summary: Five object-oriented design principles for code that's easier to change — what each actually means, with examples and common misreadings.
difficulty: intermediate
tags: [solid, oop, design, architecture]
order: 2
related: [design/object-oriented-programming, design/dependency-injection, design/dry-principle]
status: needs-review
reviewNotes: Imported from the 2023 SOLID note. Kept the structure; corrected Dependency Inversion (the original described dependency injection by the caller rather than depending on abstractions), updated Open/Closed away from inheritance-only extension, and added examples.
---

SOLID is a set of five design principles popularised by Robert C. Martin. They're guidelines for keeping code **easy to change**, not laws — apply them where change is likely.

## S — Single Responsibility Principle

> A class should have one, and only one, **reason to change**.

"Responsibility" means a source of change — usually one stakeholder or concern. An `Invoice` class that calculates totals, renders PDFs *and* emails customers changes whenever finance, design or marketing want something different.

```ts
// Split by reason to change
class InvoiceCalculator { total(invoice: Invoice): Money { /* … */ } }
class InvoicePdfRenderer { render(invoice: Invoice): Buffer { /* … */ } }
class InvoiceMailer { send(invoice: Invoice, pdf: Buffer): Promise<void> { /* … */ } }
```

## O — Open/Closed Principle

> Software entities should be **open for extension, closed for modification**.

Add new behaviour by adding new code, not editing tested code. Inheritance is one way, but today it's more often done with **interfaces, composition or strategies**:

```ts
interface DiscountRule { applies(order: Order): boolean; amount(order: Order): Money; }
// New promotions = new DiscountRule classes; the checkout code never changes.
```

## L — Liskov Substitution Principle

> Subtypes must be usable anywhere their base type is expected **without breaking correctness**.

A subclass must honour the base class's contract: accept at least the same inputs, give at least the same guarantees, throw no surprising exceptions. The classic violation is `Square extends Rectangle` — setting the width of a "rectangle" unexpectedly changes its height.

## I — Interface Segregation Principle

> Clients shouldn't be forced to depend on methods they don't use.

Prefer several small, role-specific interfaces (`IReadOrders`, `IWriteOrders`) over one large one. Implementers aren't forced to stub irrelevant methods, and consumers depend only on what they need.

## D — Dependency Inversion Principle

> High-level modules shouldn't depend on low-level modules; **both should depend on abstractions**.

The business logic defines the interface it needs; infrastructure implements it.

```csharp
// The high-level policy owns the abstraction…
public interface IOrderRepository { Task<Order?> GetAsync(Guid id); }

public class OrderService(IOrderRepository orders)   // depends on the abstraction
{
    public async Task CancelAsync(Guid id) { /* … */ }
}

// …and the low-level detail implements it.
public class SqlOrderRepository : IOrderRepository { /* EF Core, SQL, … */ }
```

> [!NOTE]
> Dependency *inversion* (a design principle) is often confused with dependency *injection* (a technique for supplying dependencies). DI is the usual way to *achieve* DIP. See [Dependency Injection](dependency-injection.md).

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: Give an example of a SOLID principle you've applied — or a violation you fixed.
A: Use a **concrete story**. Strong examples:
- **SRP**: splitting a class that calculated, formatted and emailed invoices, because changes from different teams kept colliding.
- **OCP / Strategy**: replacing a growing `switch` on payment type with a strategy per provider, so new providers didn't touch tested code.
- **DIP**: introducing an interface for a repository or external client so business logic could be unit-tested without a database.
- Explain the problem it caused, what you changed, and the result — and be ready to discuss trade-offs.

Q: When is applying SOLID principles overkill?
A: When the abstraction costs more than the change it protects against.
- Small scripts, prototypes and code unlikely to change don't need interfaces for every class.
- One implementation behind an interface "just in case" adds indirection without benefit (YAGNI).
- Apply the principles where change is **likely or already happening**; refactor toward them when duplication or pain appears.

Q: Composition or inheritance — how do you choose?
A: **Default to composition**: build behaviour from small objects with clear interfaces, injected and swappable.
- Use inheritance for genuine "is-a" relationships with shared behaviour and a stable base — or when a framework expects it (base controllers, Template Method lifecycles).
- Deep hierarchies are brittle: base-class changes ripple everywhere and subclasses depend on internals.
```

```recall
Q: What does "reason to change" mean in the Single Responsibility Principle?
A: A distinct source of change — typically a separate concern or stakeholder. A class should be affected by only one.

Q: State the Dependency Inversion Principle.
A: High-level modules shouldn't depend on low-level modules; both should depend on abstractions (and abstractions shouldn't depend on details).

Q: Why does Square-extends-Rectangle violate Liskov Substitution?
A: Code expecting a Rectangle assumes width and height change independently; a Square breaks that contract, so it can't safely substitute.

Q: How is the Open/Closed Principle usually achieved in modern code?
A: By depending on interfaces/abstractions and adding new implementations (strategies, plugins, composition) instead of editing existing code.
```
