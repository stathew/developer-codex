---
title: API Styles Compared
summary: REST, GraphQL, gRPC, SOAP, webhooks and real-time options side by side — how each works and how to choose for a given client and use case.
difficulty: intermediate
tags: [api, architecture, rest, graphql, grpc, soap, backend]
order: 9
related: [backend/rest-api-design, backend/graphql, backend/grpc, backend/soap, backend/webhooks]
status: needs-review
reviewNotes: New hub entry comparing the API styles in the codex, created alongside the protocols backlog batch.
---

There's no single best API style. Each makes different trade-offs between flexibility, performance, tooling and how easy it is for others to consume. Most real systems use **more than one**: for example, REST or GraphQL at the edge, gRPC between services, and webhooks for notifying partners.

## At a glance

| | [REST](rest-api-design.md) | [GraphQL](graphql.md) | [gRPC](grpc.md) | [SOAP](soap.md) |
| --- | --- | --- | --- | --- |
| **Model** | Resources + HTTP methods | Typed graph + queries | Remote procedures | XML message operations |
| **Transport** | HTTP/1.1 or 2 | HTTP (usually POST) | HTTP/2 | HTTP (usually POST) |
| **Format** | JSON (usually) | JSON | Protocol Buffers (binary) | XML |
| **Contract** | OpenAPI (optional) | Schema (required) | `.proto` (required) | WSDL |
| **Endpoints** | Many URLs | One | One per service method | One |
| **HTTP caching** | Excellent | Poor (needs extra work) | None | None |
| **Streaming** | Limited (SSE, chunked) | Subscriptions | First-class, bidirectional | No |
| **Browser support** | Native | Native | Needs gRPC-Web/Connect | Possible but awkward |
| **Payload size** | Medium | Medium (exactly what's asked) | Small | Large |
| **Best for** | Public and general-purpose APIs | Varied client data needs | Internal service-to-service | Enterprise/legacy integration |

## Push and real-time options

The styles above are mostly **request–response**. When the server needs to push data:

| Option | Direction | Use for |
| --- | --- | --- |
| [Webhooks](webhooks.md) | Server → another server (HTTP callback) | Notifying third-party systems of events |
| **Server-Sent Events (SSE)** | Server → browser, one-way over HTTP | Live feeds, notifications, streaming AI responses |
| **WebSockets** | Two-way, persistent connection | Chat, collaborative editing, games |
| **gRPC streaming** | Two-way, between services | Real-time internal pipelines |
| **Message brokers** (Kafka, RabbitMQ, Service Bus) | Asynchronous, decoupled | Event-driven architectures, work queues |

## How to choose

1. **Who's the consumer?**
   - Third parties and the public: **REST** (+ OpenAPI). It's the most familiar and the easiest to consume.
   - Your own varied frontends: **GraphQL**, or a REST [BFF](api-gateway.md#backend-for-frontend-bff).
   - Your own services: **gRPC**.
2. **What are the performance needs?** High-throughput or low-latency internal calls favour gRPC.
3. **Do you need streaming?** gRPC, WebSockets or SSE.
4. **Is caching important?** REST benefits most from HTTP caches and CDNs.
5. **Are you integrating with an existing system?** Use what it speaks. That's often SOAP in enterprise and finance.
6. **What does the team already know?** Familiarity and tooling matter more than benchmark differences for most applications.

> [!TIP]
> Don't pick a style for its popularity. A boring, well-designed REST API beats a poorly designed GraphQL or gRPC one. The design principles (clear contracts, consistent errors, versioning, idempotency) apply to all of them.

```recall
Q: Which API style is usually best for public, third-party APIs, and why?
A: REST with OpenAPI: it's the most widely understood, works natively everywhere, and benefits from HTTP caching.

Q: Which API style is typically used for internal service-to-service calls, and why?
A: gRPC: compact binary Protocol Buffers over HTTP/2, strongly typed generated clients and first-class streaming.

Q: When would you choose Server-Sent Events over WebSockets?
A: When you only need one-way, server-to-browser pushes (feeds, notifications, streamed responses); SSE is simpler and runs over plain HTTP.

Q: Name an API style that offers poor HTTP caching, and why.
A: GraphQL (or gRPC, or SOAP): requests typically go as POSTs to a single endpoint, so URL-based HTTP and CDN caching doesn't apply.
```
