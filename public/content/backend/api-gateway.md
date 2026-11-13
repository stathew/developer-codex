---
title: API Gateway
summary: A single entry point in front of many services that routes requests and centralises cross-cutting concerns like auth, rate limiting and TLS.
difficulty: intermediate
tags: [architecture, microservices, api, backend]
order: 7
related: [backend/rest-api-design, backend/oauth-and-openid-connect]
status: needs-review
reviewNotes: Imported from the 2023 "Gateway API" note. Renamed to API Gateway (the established term — "Gateway API" is a separate Kubernetes networking spec); kept the routing definition and added responsibilities, BFF, products and trade-offs.
---

An **API gateway** is a single entry point that sits in front of a set of backend services. Clients call the gateway; it decides which internal service should handle each request and forwards it.

```text
            ┌──────────────┐     /orders/*   ┌────────────────┐
 clients ──▶│  API gateway │ ───────────────▶│ orders service │
            │  auth, TLS,  │     /users/*    ├────────────────┤
            │  rate limits │ ───────────────▶│ users service  │
            └──────────────┘                 └────────────────┘
```

## What gateways typically handle

- **Routing** — map public paths to internal services and versions.
- **Authentication** — validate tokens once at the edge.
- **Rate limiting and quotas** — protect services from abuse.
- **TLS termination**, compression, CORS.
- **Aggregation** — combine several internal calls into one client response.
- **Observability** — consistent logging, metrics and request IDs.

## Backend for Frontend (BFF)

A variant where each client type (web, mobile, partner) gets its **own** gateway, shaped to its needs. A BFF is also a good place to keep OAuth tokens server-side, so the browser only holds a secure session cookie.

## Options

Managed: Azure API Management, AWS API Gateway, Google Apigee. Self-hosted: YARP (.NET), Kong, NGINX, Envoy, Traefik.

> [!NOTE]
> Don't confuse an API gateway with the Kubernetes **Gateway API**, a specification for configuring ingress traffic in clusters. The names are similar; the concepts overlap but aren't the same.

## Trade-offs

- An extra network hop and a **critical single point of failure** — run it highly available.
- Keep **business logic out** of the gateway, or it becomes a bottleneck every team must change.

```recall
Q: What is an API gateway?
A: A single entry point in front of multiple backend services that routes requests and handles cross-cutting concerns such as auth, rate limiting and TLS.

Q: What is the Backend for Frontend (BFF) pattern?
A: A separate gateway per client type (e.g. web, mobile), tailored to that client's needs.

Q: What shouldn't go in an API gateway?
A: Business logic — it should stay in the services so the gateway doesn't become a shared bottleneck.
```
