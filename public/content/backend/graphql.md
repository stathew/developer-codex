---
title: GraphQL
summary: A query language for APIs where clients ask for exactly the data they need from a typed schema — queries, mutations, resolvers, and the N+1, caching and security trade-offs.
difficulty: intermediate
tags: [graphql, api, backend, frontend]
order: 10
related: [backend/api-styles-compared, backend/rest-api-design, backend/grpc]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 GraphQL stub (no content).
---

**GraphQL** is a query language and runtime for APIs, created at Facebook (2012, open-sourced in 2015) and now stewarded by the GraphQL Foundation. Instead of many fixed endpoints, a GraphQL API exposes **one endpoint** and a **typed schema**. Clients send a query describing exactly the shape of data they want.

## The problem it solves

With REST, a mobile screen showing a user, their latest orders and each order's product names might need several round trips (**under-fetching**), and each response may include fields the screen never uses (**over-fetching**). GraphQL lets the client ask for everything in one request:

```graphql
query OrderSummary {
  user(id: "u_123") {
    name
    orders(last: 3) {
      id
      total
      lines { product { name } quantity }
    }
  }
}
```

The response mirrors the query's shape:

```json
{ "data": { "user": { "name": "Ada", "orders": [ { "id": "o_9", "total": 42.5, "lines": [ { "product": { "name": "Keyboard" }, "quantity": 1 } ] } ] } } }
```

## The schema

The schema is the contract, written in SDL (Schema Definition Language):

```graphql
type User {
  id: ID!
  name: String!
  orders(last: Int = 10): [Order!]!
}

type Order {
  id: ID!
  total: Float!
  lines: [OrderLine!]!
}

type Query {
  user(id: ID!): User
}

type Mutation {
  placeOrder(input: PlaceOrderInput!): Order!
}
```

`!` means non-null. The three root operation types are:

- **Query:** reads.
- **Mutation:** writes.
- **Subscription:** a stream of real-time updates, usually over WebSockets.

The schema is **introspectable**, which powers autocomplete, documentation and generated typed clients.

## Resolvers

Each field is backed by a **resolver** function that fetches its data. The server walks the query and calls resolvers field by field.

```csharp
// Hot Chocolate (.NET)
public class Query
{
    public Task<User?> GetUser(string id, [Service] IUserRepository users) => users.GetAsync(id);
}
```

## Trade-offs to know

### The N+1 problem

Resolving `orders → lines → product` naively runs one query per order and per line. The standard fix is a **DataLoader**, which batches and caches lookups within a request: one query for all the products instead of one each.

### Caching

REST's `GET /products/42` is easy to cache by URL with HTTP caches and CDNs. GraphQL usually sends `POST /graphql` with the query in the body, so HTTP caching doesn't help. Instead, clients use **normalised caches** (Apollo Client, urql, Relay), and servers can use **persisted queries** to make requests cacheable `GET`s.

### Security and cost

Clients can write arbitrarily deep or expensive queries. Protect the server with:

- **depth and complexity limits**;
- **pagination** on every list field;
- **timeouts**;
- **persisted queries** or an allow-list for first-party apps.

Authorisation must happen in resolvers or business logic, not just at the endpoint, because one request can touch many types.

### Errors

A GraphQL response can contain partial `data` plus an `errors` array, often with HTTP status 200. Monitoring that only watches status codes will miss failures.

## When to use GraphQL

| Good fit | Weaker fit |
| --- | --- |
| Many clients (web, iOS, Android) with different data needs | Simple CRUD with one client |
| Data from several services aggregated into one graph (federation) | File uploads and large binary data |
| Rapidly evolving frontends | Heavily cacheable public data |
| Strongly typed end-to-end tooling | Server-to-server calls (consider gRPC) |

```recall
Q: What are over-fetching and under-fetching, and how does GraphQL address them?
A: Over-fetching is receiving fields you don't need; under-fetching is needing several requests to get enough data. GraphQL lets the client request exactly the fields it needs, across related types, in one query.

Q: What are GraphQL's three root operation types?
A: Query (read), Mutation (write) and Subscription (real-time stream).

Q: What is the N+1 problem in GraphQL, and what's the usual fix?
A: Nested resolvers issuing one data fetch per parent item; DataLoader batches and caches those fetches within a request.

Q: Why is HTTP caching harder with GraphQL than REST?
A: GraphQL typically uses a single POST endpoint with the query in the body, so URL-based HTTP and CDN caching doesn't apply; persisted queries and client-side normalised caches are used instead.

Q: How do you protect a GraphQL server from expensive queries?
A: Depth and complexity limits, mandatory pagination, timeouts, and persisted or allow-listed queries.
```
