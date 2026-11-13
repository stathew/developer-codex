---
title: Observability
summary: Understanding what your system is doing in production — logs, metrics and traces, OpenTelemetry, structured logging, SLOs and alerting that doesn't cry wolf.
difficulty: intermediate
tags: [observability, logging, monitoring, opentelemetry, devops]
order: 5
related: [devops/ci-cd, backend/event-driven-architecture, security/owasp-top-10]
status: needs-review
reviewNotes: New entry from the topic-gaps batch.
---

**Observability** is how well you can understand a system's internal state from the data it emits, including problems you didn't anticipate. Monitoring tells you *that* something is wrong; observability helps you find out *why*.

## The three pillars

| Signal | What it is | Answers |
| --- | --- | --- |
| **Logs** | Timestamped records of events | "What exactly happened in this request?" |
| **Metrics** | Numeric measurements aggregated over time | "Is error rate or latency rising? How much?" |
| **Traces** | The path of one request across services, as timed **spans** | "Where did these 3 seconds go?" |

They're most powerful when linked: a latency spike in a metric leads to slow traces, and a trace ID leads to that request's logs.

## Structured logging

Log **events with fields**, not interpolated sentences:

```csharp
// ❌ Unsearchable text
logger.LogInformation($"Order {order.Id} placed by {user.Id} for {order.Total}");

// ✅ Structured: each value is a queryable field
logger.LogInformation("Order {OrderId} placed by {CustomerId} for {Total}", order.Id, user.Id, order.Total);
```

- Use **levels** consistently: Debug, Information, Warning, Error, Critical.
- Include a **correlation or trace ID** in every log line.
- **Never log** passwords, tokens, full card numbers or unnecessary personal data.

## Metrics that matter

For request-driven services, the **RED** method:

- **Rate:** requests per second.
- **Errors:** failed requests per second.
- **Duration:** latency, tracked as **percentiles** (p50, p95, p99), not averages. Averages hide the slow tail that users feel.

For resources (CPU, memory, queues), the **USE** method: Utilisation, Saturation, Errors.

## Distributed tracing

A trace follows one request through the gateway, services, database and queues. Each **span** records an operation, its timing and attributes. A **trace context** (the W3C `traceparent` header) is propagated across calls, including through message brokers.

## OpenTelemetry

**OpenTelemetry (OTel)** is the vendor-neutral, CNCF standard for producing logs, metrics and traces. You instrument once and send the data to any backend (Grafana, Jaeger, Prometheus, Azure Monitor, Datadog, Honeycomb…).

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddOtlpExporter())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddRuntimeInstrumentation().AddOtlpExporter());
```

.NET Aspire's dashboard shows OpenTelemetry data locally during development.

## SLIs, SLOs and error budgets

- **SLI (indicator):** a measurement, such as the percentage of requests faster than 300 ms.
- **SLO (objective):** a target for it: 99.5% of requests under 300 ms over 30 days.
- **Error budget:** the allowed failure (0.5%). While budget remains, ship features. When it's spent, prioritise reliability.

## Alerting that works

- Alert on **symptoms users feel** (error rate, latency SLO burn), not on every cause (CPU at 80%).
- Every alert should be **actionable** and link to a runbook.
- Too many alerts lead to **alert fatigue**, and real incidents get ignored.
- Use dashboards for exploration and alerts for interruptions.

```recall
Q: What are the three pillars of observability?
A: Logs (discrete events), metrics (aggregated numbers over time) and traces (a request's path across services as spans).

Q: Why use latency percentiles instead of averages?
A: Averages hide the slow tail; p95/p99 show the experience of the slowest requests users actually feel.

Q: What is structured logging?
A: Logging events with named, queryable fields (e.g. OrderId, CustomerId) rather than free-text interpolated strings.

Q: What's the difference between an SLI and an SLO?
A: An SLI is a measured indicator of service level (e.g. % of fast requests); an SLO is the target for that indicator.

Q: What is OpenTelemetry?
A: A vendor-neutral standard and set of SDKs for generating and exporting traces, metrics and logs to any observability backend.

Q: What makes a good alert?
A: It reflects user-facing symptoms, is actionable, and links to a runbook — avoiding alert fatigue.
```
