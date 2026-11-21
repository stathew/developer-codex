---
title: Azure Functions
summary: Event-driven serverless compute on Azure — triggers and bindings, hosting plans, the isolated worker model, and cold starts.
difficulty: intermediate
tags: [azure, cloud, serverless, dotnet]
order: 2
related: [azure/choosing-azure-compute, azure/messaging-on-azure, backend/aspnet-core, backend/event-driven-architecture]
status: needs-review
reviewNotes: New entry. The in-process .NET model's end of support (10 Nov 2026) was verified fresh on 2026-11-21 — this entry is being written 11 days after that date, so it recommends the isolated worker model as the only supported option rather than mentioning in-process as a current alternative.
---

**Azure Functions** runs your code in response to an event — an HTTP request, a message on a queue, a timer, a new blob — without you provisioning or managing a server. You write a function; Azure handles scaling it out (and, on the right plan, scaling it to zero).

## Triggers and bindings

A **trigger** starts a function; **bindings** declaratively connect it to inputs and outputs, so you're not hand-writing SDK calls for common cases.

```csharp
[Function("ProcessOrder")]
public async Task Run(
    [ServiceBusTrigger("orders", Connection = "ServiceBusConnection")] ServiceBusReceivedMessage message,
    [CosmosDBOutput("Shop", "Orders", Connection = "CosmosConnection")] IAsyncCollector<Order> orders,
    FunctionContext context)
{
    var order = JsonSerializer.Deserialize<Order>(message.Body);
    await orders.AddAsync(order!);
}
```

Common triggers: **HTTP**, **Timer** (cron expression), **Queue/Service Bus**, **Blob**, **Event Grid**, **Cosmos DB change feed**. Bindings exist for most Azure data and messaging services, plus HTTP responses.

## Hosting plans

| Plan | Scaling | Cold starts | Use for |
| --- | --- | --- | --- |
| **Consumption** | Scales to zero, pay per execution | Possible after idle | Spiky, infrequent, cost-sensitive workloads |
| **Flex Consumption** | Scales to zero, faster scale-out, always-ready instances optional | Reduced | Latency-sensitive event-driven workloads |
| **Premium** | Pre-warmed instances, VNet integration | None (warm instances) | Latency-sensitive, needs VNet access to other resources |
| **Dedicated (App Service plan)** | Fixed capacity you scale manually | None | Predictable, steady load; sharing a plan with a web app |

> [!WARNING]
> Cold starts are the most common Functions complaint: after a period of inactivity on Consumption, the first request pays the cost of starting a new instance. If you need consistent low latency, use Flex Consumption with always-ready instances or the Premium plan.

> [!NOTE]
> Microsoft now documents the classic Consumption plan as **legacy**: for a new serverless function app, use **Flex Consumption** instead — it's generally available, offers faster scale-out and the same scale-to-zero billing, and is the recommended starting point.

## The isolated worker model

.NET Azure Functions have two execution models, and as of **10 November 2026 the in-process model is out of support** — the isolated worker model is now the only supported way to write .NET functions. It runs your function in its own process rather than inside the Functions host, which means:

- You control the .NET version independently of the host (works with any current LTS/STS release, not just what the host ships).
- Full control over the DI container and middleware pipeline, the same `IServiceCollection` patterns as ASP.NET Core.
- Slightly different binding types (`HttpRequestData`/`HttpResponseData` instead of `HttpRequest`/`IActionResult`).

```csharp
var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services => services.AddSingleton<IOrderRepository, SqlOrderRepository>())
    .Build();
host.Run();
```

## Durable Functions

For workflows spanning multiple steps — fan-out/fan-in, long-running orchestrations, human-approval waits — **Durable Functions** adds stateful orchestration on top of the normal triggers, checkpointing progress so an orchestration can survive restarts.

## When Functions is the wrong choice

- **Always-busy workloads** — a Dedicated/App Service plan (or App Service itself) is cheaper and has no cold starts.
- **Long-running synchronous work** — functions have execution time limits (shorter on Consumption); offload to a queue plus a longer-running host, or Durable Functions.
- **Complex local dependencies** (VNet-only databases) without Premium/Flex Consumption's networking features.

```recall
Q: What is the difference between a trigger and a binding in Azure Functions?
A: A trigger starts the function execution (HTTP call, queue message, timer); bindings declaratively connect inputs/outputs (e.g. writing to Cosmos DB) without hand-written SDK code.

Q: Which .NET execution model should new Azure Functions use, and why?
A: The isolated worker model — the in-process model's support ended 10 November 2026, and isolated also gives independent .NET version control and the standard ASP.NET Core-style DI pipeline.

Q: What causes a Functions cold start, and how do you avoid it?
A: A new instance starting after a period of inactivity on the Consumption plan; avoid it with Premium (pre-warmed instances) or Flex Consumption's always-ready instances.
```
