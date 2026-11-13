---
title: Event-Driven Architecture
summary: Systems that communicate by publishing and reacting to events — events vs commands, brokers, eventual consistency, the outbox pattern, sagas and event sourcing.
difficulty: advanced
tags: [architecture, events, messaging, microservices, kafka, backend]
order: 14
related: [backend/webhooks, design/observer-pattern, design/domain-driven-design, backend/api-styles-compared]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Event Driven Development stub (filed under Development Lifecycle › Programming Approaches); written as event-driven architecture.
---

In an **event-driven architecture (EDA)**, components communicate by **publishing events** (facts about something that happened) and **reacting** to events published by others. The publisher doesn't know or care who's listening. It's the [Observer pattern](../design/observer-pattern.md) scaled up to whole systems.

## Events vs commands

| | Event | Command |
| --- | --- | --- |
| Meaning | Something **happened** | Please **do** something |
| Naming | Past tense: `OrderPlaced` | Imperative: `PlaceOrder` |
| Receivers | Zero or many; the publisher doesn't know them | Exactly one handler |
| Can be rejected? | No; it's a fact | Yes |

```json
{
  "type": "OrderPlaced",
  "id": "evt_01JD3N",
  "occurredAt": "2026-11-13T10:42:00Z",
  "data": { "orderId": "o_9", "customerId": "c_7", "total": 42.50 }
}
```

When `OrderPlaced` is published, the payment, inventory, email and analytics services can each react independently. Adding a new consumer doesn't change the order service at all.

## How events travel

- **Message brokers and queues** (RabbitMQ, Azure Service Bus, Amazon SQS): each message is delivered to a consumer and then removed. Good for work distribution and commands.
- **Event streams / logs** (Apache Kafka, Azure Event Hubs, Amazon Kinesis): an append-only, retained log. Consumers track their own position and can **replay** history.
- **Within a process:** a simple event dispatcher or mediator.

## Styles of event

- **Event notification:** a thin event ("order o_9 was placed"); consumers call back for details if they need them.
- **Event-carried state transfer:** the event includes the data consumers need, so they don't call back. Less coupling at runtime, larger events.
- **Event sourcing:** the events *are* the source of truth; current state is rebuilt by replaying them. Powerful for auditing, but complex. It's often paired with **CQRS** (separate models for writes and reads).

## The hard parts

### Eventual consistency

Consumers update *after* the event, so for a while different services disagree. Design the UI and business processes for that ("order received" before "payment confirmed").

### Delivery guarantees and idempotency

Most brokers deliver **at least once**, so duplicates happen. Make consumers **idempotent**: record processed event IDs, or use natural idempotency (upserts).

### The dual-write problem and the outbox pattern

Saving to your database and publishing to the broker are two separate operations. If one fails, they disagree. The **transactional outbox** solves this:

1. In the same database transaction as the business change, insert the event into an `outbox` table.
2. A background relay reads the outbox and publishes to the broker, retrying until it succeeds.

### Ordering

Ordering is usually guaranteed only within a partition or session (for example, per order ID). Don't assume global order.

### Sagas

A business process spanning services (reserve stock → charge card → arrange shipping) can't use one database transaction. A **saga** coordinates it as a series of local steps, with **compensating actions** to undo earlier steps on failure. The steps can be choreographed by events or orchestrated by a coordinator.

### Observability

Following a request through asynchronous hops needs **correlation IDs** and distributed tracing (OpenTelemetry).

## When to use it

| Good fit | Weaker fit |
| --- | --- |
| Many independent reactions to the same business fact | Simple CRUD apps |
| Decoupling teams and services | Workflows needing immediate, strongly consistent results |
| Integrating systems, buffering load spikes | Small teams without the operational maturity for brokers |
| Audit trails and replay (event sourcing) | |

```recall
Q: What's the difference between an event and a command?
A: An event states a fact that already happened (past tense, any number of consumers, can't be rejected); a command requests an action (imperative, one handler, can be rejected).

Q: Why must event consumers be idempotent?
A: Brokers typically deliver at least once, so the same event can arrive multiple times.

Q: What problem does the transactional outbox pattern solve?
A: The dual-write problem: it saves the event in the same database transaction as the business change, and a relay publishes it reliably afterwards.

Q: What is a saga?
A: A way to coordinate a multi-service business process as a sequence of local transactions, with compensating actions to undo completed steps if a later one fails.

Q: What is event sourcing?
A: Storing the sequence of events as the source of truth and deriving current state by replaying them.
```
