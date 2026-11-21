---
title: Azure Monitor & Application Insights
summary: Observability on Azure — Application Insights telemetry, Log Analytics and KQL, the Application Map, and alerting that doesn't cry wolf.
difficulty: intermediate
tags: [azure, cloud, observability, monitoring]
order: 6
related: [devops/observability, azure/azure-app-service, backend/event-driven-architecture]
status: needs-review
reviewNotes: New entry, the Azure-specific counterpart to the general Observability entry. Feature claims checked against current Microsoft Learn guidance on 2026-11-21.
---

**Azure Monitor** is the umbrella platform for metrics, logs and alerts across Azure. **Application Insights** is its application performance monitoring (APM) piece — the one you'll use day to day for an ASP.NET Core API or Angular SPA. If you've read [Observability](../devops/observability.md), this is the Azure-flavoured version of logs/metrics/traces.

## Getting telemetry in

```csharp
builder.Services.AddApplicationInsightsTelemetry(); // ASP.NET Core
```

This one line gives you, automatically: requests, dependencies (outgoing HTTP calls, SQL queries), exceptions, and performance counters — correlated by an operation ID so you can follow one request across every piece it touched.

```ts
// Angular (@microsoft/applicationinsights-web)
const appInsights = new ApplicationInsights({ config: { connectionString: '...' } });
appInsights.loadAppInsights();
appInsights.trackPageView();
```

Add custom events and metrics for anything business-specific:

```csharp
telemetryClient.TrackEvent("OrderPlaced", new Dictionary<string, string> { ["CustomerTier"] = "Gold" });
```

## The Application Map

Application Insights automatically draws a live map of your services and their dependencies — which API calls which database, which queue, which downstream service — with response times and failure rates on each edge. It's usually the fastest way to spot "which hop in this request is slow" without reading a single log line.

## Log Analytics and KQL

Telemetry lands in a **Log Analytics workspace**, queried with **KQL** (Kusto Query Language):

```kql
requests
| where timestamp > ago(1h)
| where success == false
| summarize count() by resultCode, bin(timestamp, 5m)
| order by timestamp desc
```

```kql
dependencies
| where type == "SQL"
| where duration > 1000
| project timestamp, name, duration, operation_Id
| order by duration desc
```

KQL's pipe-based syntax (`|` chaining operators like `where`, `summarize`, `project`, `join`) feels closer to LINQ or shell pipelines than SQL, and it's worth learning well — it's also how you query Azure resource logs, Microsoft Sentinel and most of Azure's log surfaces.

## Alerting

Alert rules fire on a metric crossing a threshold, a log query matching (scheduled KQL alerts), or an activity log event (a resource was deleted). Route them to an **Action Group** — email, SMS, a webhook, an Azure Function, or paging via a tool like PagerDuty/Opsgenie through a webhook.

> [!TIP]
> Alert on **symptoms** (error rate, p95 latency, failed dependency calls) rather than every possible cause, and make sure every alert has somewhere useful to go — a dashboard nobody watches isn't observability. See [Observability](../devops/observability.md#alerting-that-works).

## Sampling and cost

Application Insights can get expensive at high volume. **Adaptive sampling** automatically reduces the percentage of telemetry sent while preserving the overall request/failure counts, so you keep accurate metrics while paying for a fraction of the raw data.

```recall
Q: What does adding AddApplicationInsightsTelemetry() to an ASP.NET Core app give you automatically?
A: Automatic collection of requests, outgoing dependency calls, exceptions and performance counters, correlated by operation ID across a request.

Q: What is the Application Map used for?
A: A live, automatically generated view of a system's services and dependencies with response times and failure rates per edge — useful for spotting which hop in a request is slow.

Q: What language do you use to query Application Insights / Log Analytics data?
A: KQL (Kusto Query Language) — a pipe-chained query syntax (`|` between operators like where, summarize, project).

Q: Why use adaptive sampling in Application Insights?
A: To control cost at high telemetry volume by sending a representative fraction of the data while keeping request/failure counts accurate.
```
