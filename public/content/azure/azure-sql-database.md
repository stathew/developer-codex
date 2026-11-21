---
title: Azure SQL Database
summary: SQL Server as a managed Azure service — deployment options, DTU vs vCore purchasing models, serverless compute, high availability and built-in security.
difficulty: intermediate
tags: [azure, cloud, sql, mssql, databases]
order: 3
related: [databases/relational-databases, databases/indexes, azure/entra-id-and-app-identity, azure/choosing-azure-compute]
status: needs-review
reviewNotes: New entry. Service-tier and HA facts checked against current Microsoft Learn guidance on 2026-11-21.
---

**Azure SQL Database** is SQL Server as a fully managed PaaS service: Microsoft handles patching, backups, and high availability, and you get most of the SQL Server engine you already know, including the same T-SQL and the same execution-plan tools.

## Deployment options

| Option | What it is | Choose it when |
| --- | --- | --- |
| **Azure SQL Database** (single DB or elastic pool) | One database per logical server, fully managed | New applications; cloud-native design |
| **Azure SQL Managed Instance** | Near-100% SQL Server surface area, instance-level features (cross-database queries, SQL Agent, CLR) | Migrating an existing SQL Server app with minimal changes |
| **SQL Server on an Azure VM** | You manage the OS and SQL Server install | Need full control, specific SQL Server version/features, or Windows-level licensing not covered by PaaS |

**Elastic pools** share compute across many databases with unpredictable, non-overlapping usage (e.g. one database per tenant) — cheaper than provisioning each database for its own peak.

## Purchasing models

- **DTU (Database Transaction Unit)** — a single bundled measure of CPU, memory and I/O. Simple, but opaque when you need to tune one resource specifically.
- **vCore** — you choose compute and storage independently, map to familiar CPU/memory units, and can bring your own SQL Server licence (Azure Hybrid Benefit) for savings. The vCore model is the current recommendation for new deployments; it also unlocks serverless and Hyperscale tiers.

### Serverless compute tier (vCore)

Auto-scales compute within a configured min/max, and can **auto-pause** after inactivity, billing per second of actual usage. Good for dev/test and apps with intermittent, unpredictable traffic — not for workloads that can't tolerate the resume latency after a pause.

### Hyperscale (vCore)

A storage architecture that decouples compute from storage for very large databases (fast backups regardless of size, rapid scale-up, read-scale replicas), rather than a tier for small databases.

## High availability and disaster recovery

- **Zone-redundant configuration** spreads replicas across availability zones within a region.
- **Active geo-replication** / **auto-failover groups** keep a readable secondary in another region, with automatic failover and a stable listener endpoint your app doesn't need to change on failover.
- Point-in-time restore is built in; you don't manage backup jobs.

## Security built in

- **Microsoft Entra ID authentication** alongside SQL authentication — use [Managed Identity](entra-id-and-app-identity.md) from an app so there's no connection-string password at all.
- **Transparent Data Encryption (TDE)** — encryption at rest, on by default.
- **Microsoft Defender for SQL** — scans for vulnerabilities and flags anomalous access patterns.
- **Firewall rules** and **Private Endpoint** support to keep the database off the public internet.

```csharp
// Connecting with Managed Identity — no password in the connection string
var connection = new SqlConnection("Server=my-server.database.windows.net;Database=Shop;Authentication=Active Directory Default;");
```

> [!AI]
> AI-generated connection strings very often default to SQL authentication with a plaintext password baked in. For Azure SQL from an Azure-hosted app, push back and use Managed Identity instead — see [Secrets Management](../security/secrets-management.md).

```recall
Q: What's the difference between Azure SQL Database and Azure SQL Managed Instance?
A: Azure SQL Database is the cloud-native PaaS offering per database; Managed Instance offers near-complete SQL Server instance-level compatibility (cross-database queries, SQL Agent), suited to migrating existing apps with minimal change.

Q: Why is the vCore purchasing model generally preferred over DTU for new deployments?
A: It lets you size compute and storage independently, supports Azure Hybrid Benefit licensing, and is required for serverless and Hyperscale tiers.

Q: How does an auto-failover group help during a regional outage?
A: It keeps a readable secondary database in another region and fails over automatically, with a stable endpoint so the application's connection string doesn't need to change.

Q: How can an Azure-hosted app connect to Azure SQL Database without storing a password?
A: Authenticate with Microsoft Entra ID via the app's Managed Identity instead of SQL authentication.
```
