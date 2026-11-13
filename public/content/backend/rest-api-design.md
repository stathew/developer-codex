---
title: REST API Design
summary: Resource modelling, HTTP methods and status codes, idempotency, pagination and versioning — the conventions that make an API predictable.
difficulty: intermediate
tags: [api, http, rest, backend]
order: 1
related: [backend/authentication-sessions-vs-tokens, databases/indexes]
---

A good API is **predictable**: once a consumer has used one endpoint, they can guess how the rest behave. REST gets you most of the way there by leaning on HTTP's existing semantics instead of inventing new ones.

## Model resources, not actions

Use nouns for resources and let the HTTP method be the verb.

| ✅ Resource-oriented | ❌ RPC-style |
| --- | --- |
| `GET /orders/42` | `GET /getOrder?id=42` |
| `POST /orders` | `POST /createOrder` |
| `POST /orders/42/cancellation` | `POST /cancelOrder` |

Sub-resources express relationships: `GET /customers/7/orders`. Keep nesting shallow — one level is usually enough.

## Methods and their guarantees

| Method | Purpose | Safe | Idempotent |
| --- | --- | --- | --- |
| `GET` | Read | ✅ | ✅ |
| `PUT` | Replace / create at known URL | — | ✅ |
| `PATCH` | Partial update | — | ❌* |
| `DELETE` | Remove | — | ✅ |
| `POST` | Create / non-idempotent action | — | ❌ |

**Safe** means no side effects. **Idempotent** means doing it twice has the same effect as doing it once — critical, because networks retry.

\* `PATCH` *can* be idempotent depending on the patch format.

### Idempotency keys

To make `POST` safe to retry (payments!), accept a client-generated key and store the result against it:

```http
POST /payments
Idempotency-Key: 9f1c2a4e-7b1d-4c55-a0b6-1f2e3d4c5b6a
Content-Type: application/json

{ "amount": 4200, "currency": "GBP" }
```

A repeat request with the same key returns the original response instead of charging twice.

## Status codes that matter

- **200** OK · **201** Created (with `Location` header) · **204** No Content
- **400** Bad request (validation) · **401** Unauthenticated · **403** Forbidden (authenticated, not allowed) · **404** Not found · **409** Conflict · **422** Unprocessable entity
- **429** Too many requests (with `Retry-After`)
- **500** Server error · **503** Unavailable

> [!IMPORTANT]
> Never return `200` with `{ "error": ... }` in the body. Clients, proxies, monitoring and retry logic all rely on the status code.

Return errors in a consistent shape, e.g. [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457):

```json
{ "type": "https://api.example.com/errors/insufficient-stock", "title": "Insufficient stock", "status": 409, "detail": "Only 2 units of SKU-123 remain." }
```

## Pagination

- **Offset** (`?limit=20&offset=40`) — simple, supports jumping to page *n*, but slow on deep pages and unstable when rows are inserted.
- **Cursor** (`?limit=20&after=eyJpZCI6NDJ9`) — stable and fast (uses an index seek), but no random access. Prefer it for feeds and large tables.

## Versioning

Additive changes (new fields, new endpoints) shouldn't need a new version — design clients to ignore unknown fields. For breaking changes, a URL prefix (`/v2/`) is the most explicit and cache-friendly option.

```recall
Q: What does it mean for an HTTP method to be idempotent?
A: Making the same request multiple times has the same effect on the server as making it once.

Q: What's the difference between 401 and 403?
A: 401 means the client isn't authenticated (no/invalid credentials); 403 means it is authenticated but not allowed to do this.

Q: Why prefer cursor pagination over offset pagination for large tables?
A: Cursors use an index seek so deep pages stay fast, and results don't shift when rows are inserted or deleted.

Q: How do idempotency keys make POST retries safe?
A: The server stores the result keyed by a client-supplied unique key and returns the stored result for repeats instead of re-executing.
```
