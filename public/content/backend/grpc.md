---
title: gRPC
summary: High-performance, contract-first RPC over HTTP/2 with Protocol Buffers — service definitions, streaming, deadlines, versioning rules and browser limitations.
difficulty: intermediate
tags: [grpc, protobuf, api, microservices, backend, dotnet]
order: 11
related: [backend/api-styles-compared, backend/graphql, backend/rest-api-design, backend/aspnet-core]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 gRPC stub (no content).
---

**gRPC** is an open-source remote procedure call framework, originally from Google and now a CNCF project. You define services and messages in a `.proto` file. Tooling then generates strongly typed client and server code in many languages, and calls travel as compact binary **Protocol Buffers** over **HTTP/2**.

It's the common choice for **service-to-service** communication inside a system.

## Contract first: the `.proto` file

```protobuf
syntax = "proto3";

package orders.v1;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                    // unary
  rpc WatchOrderStatus (GetOrderRequest) returns (stream OrderStatus);  // server streaming
}

message GetOrderRequest {
  string order_id = 1;
}

message Order {
  string id = 1;
  double total = 2;
  repeated OrderLine lines = 3;
}

message OrderLine {
  string product_id = 1;
  int32 quantity = 2;
}

message OrderStatus {
  string state = 1;
}
```

The numbers (`= 1`, `= 2`) are **field tags**. They, not the names, identify fields on the wire, which is why messages are so compact.

## Implementing and calling it (.NET)

```csharp
// Server: inherit from the generated base class
public class OrderServiceImpl(IOrderRepository orders) : OrderService.OrderServiceBase
{
    public override async Task<Order> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        var order = await orders.GetAsync(request.OrderId)
            ?? throw new RpcException(new Status(StatusCode.NotFound, "Order not found"));
        return order.ToProto();
    }
}

// Client: a generated, strongly typed stub
var client = new OrderService.OrderServiceClient(GrpcChannel.ForAddress("https://orders:5001"));
var order = await client.GetOrderAsync(
    new GetOrderRequest { OrderId = "o_9" },
    deadline: DateTime.UtcNow.AddSeconds(2));
```

## Four kinds of call

| Kind | Shape | Example |
| --- | --- | --- |
| **Unary** | One request, one response | Get an order |
| **Server streaming** | One request, a stream of responses | Live status updates, large result sets |
| **Client streaming** | A stream of requests, one response | Uploading telemetry in chunks |
| **Bidirectional streaming** | Both sides stream independently | Chat, real-time collaboration |

## Things to get right

### Deadlines

Every call should set a **deadline** (an absolute timeout). Deadlines propagate across service hops, so a slow downstream call can't hold resources forever.

### Status codes

gRPC has its own status codes, such as `OK`, `NOT_FOUND`, `INVALID_ARGUMENT`, `UNAVAILABLE` and `DEADLINE_EXCEEDED`. Map domain errors onto them deliberately. `UNAVAILABLE` signals that retrying is safe.

### Evolving contracts safely

- **Never change or reuse a field number.** Mark removed fields `reserved`.
- Adding fields is safe: old clients ignore unknown fields.
- Version packages (`orders.v1`, `orders.v2`) for breaking changes.

> [!WARNING]
> Reusing a deleted field's number is a classic production bug. Old clients will decode new data into the wrong field, silently.

### Load balancing

HTTP/2 keeps **long-lived connections** that multiplex many calls. A connection-level (L4) load balancer pins each client to a single backend. Use an L7 proxy (Envoy, Linkerd, a service mesh) or client-side load balancing.

## Browsers

Browsers can't speak native gRPC, because they don't expose the HTTP/2 framing it needs. The options are:

- **gRPC-Web**, via a proxy such as Envoy or ASP.NET Core's `UseGrpcWeb()` middleware;
- **Connect** (ConnectRPC), which works with plain `fetch`;
- **JSON transcoding**, which exposes the same service as REST/JSON as well (built into ASP.NET Core).

## When to use gRPC

| Good fit | Weaker fit |
| --- | --- |
| Internal microservice calls | Public APIs consumed by third parties |
| Low latency, high throughput | Browser clients (without gRPC-Web/Connect) |
| Streaming | Human-debuggable traffic (binary payloads) |
| Polyglot systems wanting one typed contract | Simple CRUD where REST is enough |

```recall
Q: What are gRPC's transport and serialisation format?
A: HTTP/2 for transport and Protocol Buffers (a compact binary format) for messages.

Q: What are the four kinds of gRPC call?
A: Unary, server streaming, client streaming and bidirectional streaming.

Q: Why must you never reuse a Protocol Buffers field number?
A: Field numbers identify fields on the wire; reusing one makes old clients decode new data into the wrong field. Mark removed numbers as reserved.

Q: Why can't browsers call gRPC services directly?
A: Browser APIs don't expose the low-level HTTP/2 framing gRPC needs; use gRPC-Web, Connect or JSON transcoding instead.

Q: Why do gRPC services need L7 (or client-side) load balancing?
A: HTTP/2 multiplexes many calls over long-lived connections, so connection-level (L4) balancing pins all of a client's calls to one backend.
```
