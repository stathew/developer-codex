---
title: System Design Fundamentals
summary: The building blocks and trade-offs behind scalable systems — scaling, load balancing, caching, data partitioning and replication, queues, and how to approach a design.
difficulty: advanced
tags: [system-design, architecture, scalability, interviews]
order: 32
related: [backend/caching, databases/choosing-a-database, backend/event-driven-architecture, backend/api-gateway]
status: needs-review
reviewNotes: New entry from the topic-gaps batch; also serves as a system-design interview primer.
---

System design is about choosing and combining components so a system meets its **functional** requirements (what it does) and **non-functional** ones: scale, latency, availability, consistency, cost. Every choice is a **trade-off**; there's no perfect design, only one that fits the requirements.

## Scaling

- **Vertical (scale up):** a bigger machine. Simple, but it has a ceiling and is a single point of failure.
- **Horizontal (scale out):** more machines behind a load balancer. Near-unlimited, but needs **stateless** services (keep session state in a shared store or tokens).

## Core building blocks

| Component | Role |
| --- | --- |
| **Load balancer** | Spreads requests across instances; health checks remove bad ones (L4 = connections, L7 = HTTP-aware routing) |
| **[API gateway](../backend/api-gateway.md)** | Single entry point: routing, auth, rate limiting |
| **[Cache](../backend/caching.md)** | Serves hot data fast (Redis, CDN) |
| **[Database](../databases/choosing-a-database.md)** | Source of truth; relational by default |
| **Message queue / stream** | Decouples producers from consumers; absorbs spikes ([EDA](../backend/event-driven-architecture.md)) |
| **Object storage** | Files, images, backups (S3, Azure Blob) |
| **CDN** | Serves static and cacheable content from near the user |
| **Search index** | Full-text search (Elasticsearch / OpenSearch) |

## Scaling the data tier

- **Read replicas:** copies that serve reads. Writes go to the primary; replicas may lag slightly (**replication lag**).
- **Partitioning / sharding:** split data across nodes by a **shard key** (customer ID, region). Choose the key to spread load evenly and keep related data together. Cross-shard queries and transactions get hard.
- **Consistent hashing:** maps keys to nodes so that adding or removing a node moves only a small fraction of keys.
- **Denormalisation and precomputation:** store data in the shape it's read (feeds, counters, materialised views).

## Reliability

- **Redundancy:** no single points of failure; multiple instances across availability zones.
- **Timeouts, retries with exponential backoff and jitter, and circuit breakers** stop one slow dependency from taking everything down.
- **Rate limiting:** token bucket or sliding window, per user or API key.
- **Idempotency:** makes retries safe (see [REST API Design](../backend/rest-api-design.md)).
- **Graceful degradation:** serve cached or partial results when a dependency fails.

## Consistency trade-offs

The **CAP theorem** says that during a network partition you choose consistency or availability. In practice, decide per feature: a bank balance needs strong consistency, while a like counter can be eventually consistent.

## Back-of-the-envelope estimation

Rough numbers decide architectures:

- 1 million requests/day ≈ **12 requests/second** on average; plan for peaks of 2–10×.
- Storage = items per day × size × retention.
- Approximate latencies: memory ~100 ns, SSD read ~100 µs, same-datacentre round trip ~0.5 ms, cross-continent round trip ~100+ ms.

## Approaching a design (and the interview)

1. **Clarify requirements:** features, users, scale, read/write ratio, latency and consistency needs. Ask before you draw.
2. **Estimate:** traffic, storage, bandwidth.
3. **Define the API** and the **data model**.
4. **High-level design:** boxes and arrows covering the main flow end to end.
5. **Deep dive** into the hardest parts: the bottleneck, the hot path, the consistency problem.
6. **Discuss trade-offs and failure modes:** what breaks first at 10× scale? What happens when a component fails?

> [!TIP]
> Interviewers care far more about **reasoning and trade-offs** than about naming specific products. "I'd use a queue here so spikes don't overload the payment service" beats a diagram with ten logos.

```recall
Q: Why must services be stateless to scale horizontally?
A: So any instance can handle any request; state lives in shared stores (databases, caches) or tokens rather than instance memory.

Q: What's the difference between replication and sharding?
A: Replication copies the same data to multiple nodes (for reads and availability); sharding splits different data across nodes (for write and storage scale).

Q: Why add jitter to retry backoff?
A: To prevent many clients retrying in lockstep and overwhelming a recovering service (thundering herd).

Q: Roughly how many requests per second is 1 million requests per day?
A: About 12 per second on average (1,000,000 / 86,400), with peaks several times higher.

Q: What's the first step in a system design interview?
A: Clarify functional and non-functional requirements (scale, latency, consistency, read/write ratio) before designing.

Q: What does a circuit breaker do?
A: Stops calling a failing dependency for a period after repeated failures, failing fast instead and letting the dependency recover.
```
