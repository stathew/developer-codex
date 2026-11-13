---
title: Technical Interview Questions
summary: Common conceptual questions — OOP, architecture, HTTP, databases, security — with concise model answers you can drill as recall cards.
difficulty: intermediate
tags: [interviews, career, oop, architecture]
order: 1
related: [career/talking-about-your-experience, career/coding-exercises, design/object-oriented-programming]
status: needs-review
reviewNotes: Imported from the 2023 Common Questions note. Most answers were placeholders ("An class."), so they were written fresh; the Interface, Abstract class and Polymorphism answers were corrected (abstract classes aren't a security feature; interfaces can have default methods); the clustered-index answer was kept and qualified. The personal "idea of success" question moved to Talking About Your Experience.
---

Model answers to common conceptual interview questions. Each question is a recall card, so marking this entry as studied adds the whole set to your review deck. Aim to answer **in your own words, with an example from your own work**; a memorised definition alone rarely impresses.

> [!TIP]
> A strong answer has three parts: a **one-sentence definition**, a **concrete example**, and a **trade-off or caveat**. The caveat is what separates you from candidates reciting definitions.

## Object-oriented programming

See [Object-Oriented Programming](../design/object-oriented-programming.md) for depth.

```recall
Q: What is a class?
A: A blueprint defining the state (fields) and behaviour (methods) of a type; objects are instances of it.

Q: What is an interface?
A: A contract listing members a type must provide. A class can implement many interfaces; consumers depend on the contract rather than a concrete class. (Since C# 8 / Java 8, interfaces can also have default method implementations.)

Q: What is an abstract class?
A: A class that can't be instantiated and is meant to be inherited. It can hold state, constructors and implemented methods alongside abstract ones that subclasses must implement. Use it to share implementation among closely related types.

Q: What is inheritance?
A: A mechanism where a subclass acquires the members of a base class and can extend or override them — an "is-a" relationship. Prefer composition when the relationship isn't truly is-a.

Q: What is encapsulation?
A: Keeping an object's state private and exposing only operations that keep it valid, so other code can't put it into an inconsistent state.

Q: What is polymorphism?
A: The ability for the same call to behave differently based on the object's runtime type — e.g. Animal.Speak() returning "Oink" for a Pig and "Meow" for a Cat via overriding. Overloading is a compile-time form.
```

## Architecture and design

```recall
Q: What is a microservice architecture?
A: Structuring a system as small, independently deployable services, each owning one business capability and its own data, communicating over the network. Benefits: independent scaling and deployment, team autonomy. Costs: distributed-system complexity, network failures, data consistency and operational overhead.

Q: What is the difference between stateful and stateless?
A: A stateless service keeps no client state between requests — every request carries what it needs — so any instance can handle it and scaling is easy. A stateful service remembers state across requests (in memory or sessions), which complicates scaling and failover.

Q: How can you ensure a codebase is maintainable?
A: Clear structure and naming, small focused units (SOLID), automated tests, code review, consistent formatting/linting, CI, up-to-date documentation, managed dependencies and paying down tech debt regularly.
```

## HTTP and APIs

```recall
Q: What is idempotency?
A: An operation is idempotent if performing it multiple times has the same effect as performing it once. GET, PUT and DELETE are idempotent; POST is not by default — idempotency keys make retries safe.
```

## Security

```recall
Q: What are some secure development principles?
A: Least privilege; defence in depth; validate input and encode output; parameterised queries; secure defaults; never roll your own crypto; keep secrets out of code; keep dependencies patched; log and monitor security events; threat-model new features (OWASP Top 10 is a good checklist).
```

## Databases

```recall
Q: What is the difference between a clustered and a non-clustered index?
A: A clustered index determines the order in which the table's rows are stored — its leaf level *is* the data — so there can be only one per table. A non-clustered index is a separate structure with pointers (or the clustered key) back to the rows; a table can have many. In SQL Server the primary key creates a clustered index by default, though it can be declared non-clustered.
```

See also [Database Indexes](../databases/indexes.md#clustered-vs-non-clustered-indexes).
