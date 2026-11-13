---
title: Template Method Pattern
summary: Define an algorithm's fixed skeleton in a base class and let subclasses fill in specific steps — plus why composition is often preferred today.
difficulty: intermediate
tags: [design-patterns, behavioral, oop, inheritance]
order: 21
related: [design/strategy-pattern, design/object-oriented-programming]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Template Method stub (title only). Follows the original Names / Intent / Motivation template.
---

**Type:** behavioural.

**Intent:** define the **skeleton of an algorithm** in a base-class method, deferring some steps to subclasses. Subclasses can redefine particular steps without changing the overall structure.

## Example: data import

Every import follows the same flow (read, parse, validate, save) but the reading and parsing differ by format.

```csharp
public abstract class DataImporter
{
    // The template method: the fixed sequence. Not virtual, so subclasses can't reorder it.
    public async Task<ImportResult> ImportAsync(string path)
    {
        var raw = await ReadAsync(path);
        var records = Parse(raw);
        var valid = records.Where(Validate).ToList();
        await SaveAsync(valid);
        OnCompleted(valid.Count);                       // optional hook
        return new ImportResult(records.Count, valid.Count);
    }

    protected abstract Task<string> ReadAsync(string path);          // required steps
    protected abstract IReadOnlyList<Customer> Parse(string raw);

    protected virtual bool Validate(Customer c) => !string.IsNullOrWhiteSpace(c.Email);  // default step
    protected virtual void OnCompleted(int count) { }                                     // hook

    private Task SaveAsync(IEnumerable<Customer> customers) { /* shared persistence */ return Task.CompletedTask; }
}

public class CsvImporter : DataImporter
{
    protected override Task<string> ReadAsync(string path) => File.ReadAllTextAsync(path);
    protected override IReadOnlyList<Customer> Parse(string raw) { /* split lines and columns */ return []; }
}

public class JsonImporter : DataImporter
{
    protected override Task<string> ReadAsync(string path) => File.ReadAllTextAsync(path);
    protected override IReadOnlyList<Customer> Parse(string raw) => JsonSerializer.Deserialize<List<Customer>>(raw)!;
}
```

## Kinds of steps

- **Abstract steps:** subclasses *must* implement them.
- **Default steps:** `virtual` with a sensible implementation that subclasses *may* override.
- **Hooks:** empty virtual methods that act as optional extension points (`OnCompleted`).

This is the **Hollywood Principle**: "don't call us, we'll call you". The base class controls the flow and calls down into subclasses.

## Where you've seen it

- Framework lifecycle methods: ASP.NET Core's `BackgroundService.ExecuteAsync`, test frameworks' setup/teardown, Angular's `ngOnInit`-style hooks.
- `Stream` subclasses overriding `Read`/`Write` inside fixed base-class logic.

## Template Method vs Strategy

Both vary part of an algorithm. Template Method uses **inheritance**: the variation is fixed at compile time by choosing a subclass. [Strategy](strategy-pattern.md) uses **composition**: the variation is an object passed in, swappable at runtime. Because inheritance couples subclasses tightly to the base class, many codebases now prefer Strategy, injecting an `IRecordParser` instead of subclassing. Template Method still suits frameworks that want to control a lifecycle.

```recall
Q: What is the Template Method pattern?
A: A base-class method defines an algorithm's fixed sequence of steps and delegates specific steps to abstract or virtual methods that subclasses implement.

Q: What is a hook in Template Method?
A: An optional extension point: a virtual method with an empty or default body that subclasses can override if they need to.

Q: How does Template Method differ from Strategy?
A: Template Method varies steps via inheritance (fixed when you choose a subclass); Strategy varies behaviour via composition (an object swappable at runtime).
```
