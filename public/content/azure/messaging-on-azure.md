---
title: "Messaging on Azure: Service Bus, Event Grid & Event Hubs"
summary: Three Azure messaging services with very different jobs — reliable queues and topics, reactive eventing, and high-throughput event streaming.
difficulty: intermediate
tags: [azure, cloud, messaging, events]
order: 4
related: [backend/event-driven-architecture, azure/azure-functions, backend/webhooks]
status: needs-review
reviewNotes: New entry. Service descriptions checked against current Microsoft Learn guidance on 2026-11-21.
---

Azure has three messaging services that look similar from a distance but solve different problems. Picking the wrong one is a common source of over- or under-engineering.

## At a glance

| | Service Bus | Event Grid | Event Hubs |
| --- | --- | --- | --- |
| **Model** | Message queue / pub-sub topic | Reactive eventing (push) | Event streaming (high throughput log) |
| **Delivery** | At-least-once, ordered (sessions), transactional | At-least-once, push with retry | Consumer-driven, replayable |
| **Typical message** | A command or work item ("process this order") | A notification that something happened ("a blob was created") | A continuous stream ("sensor reading", "click event") |
| **Volume** | Moderate | Low-to-moderate per event, but can fan out to many subscribers | Very high (millions of events/second) |
| **Retention** | Until consumed (plus dead-lettering) | Not retained — it's a notification, not a log | Configurable retention; consumers can replay |

## Service Bus: reliable work queues

Use **Service Bus** when you need a message to be processed reliably, once, possibly in order — classic enterprise messaging:

- **Queues** — one consumer processes each message (work distribution).
- **Topics and subscriptions** — pub/sub: each subscription gets its own copy of matching messages, with SQL-like filters.
- **Sessions** — guarantee ordered, grouped processing (e.g. all messages for one order ID go to the same consumer).
- **Dead-letter queue** — messages that fail repeatedly land here instead of looping forever.

This is the natural fit for the [event-driven architecture](../backend/event-driven-architecture.md) patterns like the outbox pattern and command handling.

## Event Grid: reactive glue between services

**Event Grid** routes lightweight notifications from a source (a blob was created, a VM changed state, a custom app event) to one or more handlers (a Function, a webhook, Service Bus, Event Hubs) — it's the "when X happens, tell Y" layer, not a queue you poll. It doesn't retain events for later replay; if a subscriber is offline, Event Grid retries for a limited time and then drops or dead-letters the event.

Good for: reacting to Azure resource changes, fanning a single event out to several independent handlers, and lightweight webhooks between your own services.

## Event Hubs: high-throughput event streaming

**Event Hubs** is built for ingesting very large volumes of events — telemetry, logs, clickstreams — and letting multiple independent consumers read the stream at their own pace, with **replay** (consumers track their own offset, like Kafka, which Event Hubs also has a compatible protocol for). It's about throughput and the ability to reprocess history, not guaranteed single delivery of a specific command.

## Choosing

1. **"Do this work, exactly once, maybe in order"** → Service Bus.
2. **"Tell several things this happened, no retention needed"** → Event Grid.
3. **"I need to ingest and later replay a firehose of events"** → Event Hubs.

They compose: an Event Grid subscription can deliver into a Service Bus queue for reliable processing, or trigger an [Azure Function](azure-functions.md) that writes into Event Hubs.

```recall
Q: Which Azure messaging service would you use for an order-processing queue that must be handled exactly once per order?
A: Service Bus (a queue, optionally with sessions for ordering).

Q: What's the key difference between Event Grid and Event Hubs?
A: Event Grid is lightweight reactive notification routing with no replay; Event Hubs is a high-throughput event stream that consumers can replay from any retained offset.

Q: Why doesn't Event Grid suit "process this exactly once" work?
A: It's a push-based notification system without guaranteed ordering or persistent retention for later processing — Service Bus is built for that instead.
```
