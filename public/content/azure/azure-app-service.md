---
title: Azure App Service
summary: Hosting web apps and APIs on Azure's managed platform — App Service Plans, deployment slots, Managed Identity, configuration and scaling.
difficulty: intermediate
tags: [azure, cloud, aspnet-core, hosting]
order: 1
related: [azure/choosing-azure-compute, backend/aspnet-core, azure/entra-id-and-app-identity, devops/ci-cd]
status: needs-review
reviewNotes: New entry. Service tier and feature claims checked against current Microsoft Learn guidance on 2026-11-21.
---

**Azure App Service** is a fully managed platform for hosting web apps, APIs and ASP.NET Core, Node.js, Java, Python and PHP workloads without managing servers. Azure handles the OS, runtime patching and load balancing; you deploy your app and configure the rest.

## App Service Plans

Every app runs on an **App Service Plan** — the underlying compute (VM size and count) that one or more apps share.

| Tier | Use for |
| --- | --- |
| **Free / Shared** | Experiments, not production |
| **Basic** | Dev/test, no auto-scale |
| **Standard / Premium** | Production: auto-scale, deployment slots, daily backups |
| **Isolated (App Service Environment)** | Dedicated network isolation, regulatory/compliance needs |

Scaling is two-dimensional: **scale up** (a bigger plan — more CPU/RAM) and **scale out** (more instances, manually or via autoscale rules on CPU, memory, queue length or a schedule).

## Deploying

```bash
az webapp up --name my-orders-api --resource-group rg-orders --runtime "DOTNETCORE:10.0"
```

More commonly, deployment runs through CI/CD — [Azure DevOps Pipelines](azure-devops-pipelines.md) or GitHub Actions — publishing a build artefact or container image to the app.

## Deployment slots

A **slot** is a separate, fully functional copy of the app (e.g. `staging`) with its own URL, sharing the same plan. Deploy to staging, smoke-test it, then **swap**: Azure switches traffic between slots with no downtime, and can warm up the new slot first. Settings can be marked "slot-specific" (like a staging connection string) so a swap doesn't carry them over.

> [!TIP]
> Slot swaps are also your fastest rollback: if the new version misbehaves, swap back.

## Configuration

App settings (environment variables) and connection strings are set per app (and optionally per slot) in the portal, CLI or infrastructure-as-code — never in source control. ASP.NET Core's configuration system picks these up automatically as environment variables, layering over `appsettings.json`.

```bash
az webapp config appsettings set --name my-orders-api --resource-group rg-orders \
  --settings "Features__NewCheckout=true"
```

## Managed Identity: no credentials to store

Instead of a connection string with a password, App Service can have a **system-assigned** or **user-assigned Managed Identity** — an identity in [Microsoft Entra ID](entra-id-and-app-identity.md) that Azure manages for you. Grant that identity access to Azure SQL, Key Vault or Storage, and your app authenticates with no secret anywhere:

```csharp
var credential = new DefaultAzureCredential(); // picks up the Managed Identity automatically on Azure
var client = new SecretClient(new Uri("https://my-vault.vault.azure.net/"), credential);
```

This is the single biggest practical win of moving to App Service: it removes most of the secrets you'd otherwise need to manage. See [Secrets Management](../security/secrets-management.md).

## Scaling and resilience

- **Autoscale rules** add or remove instances based on metrics or a schedule.
- **Health check** path: App Service routes traffic away from unhealthy instances automatically.
- **Always On** keeps the app warm so it doesn't unload after idle periods (needed for background tasks and to avoid cold-start latency).
- **Availability zones** (Premium v3+) spread instances across datacentres within a region.

```recall
Q: What is an App Service Plan?
A: The underlying compute (VM size and instance count) that one or more App Service apps run on and share.

Q: What is a deployment slot swap, and why is it safer than deploying straight to production?
A: Swapping traffic between a staging slot and production with no downtime (after warming up the new slot); if something's wrong, you can swap back immediately as a fast rollback.

Q: How does Managed Identity remove the need to store a database password?
A: The app authenticates to the target service (SQL, Key Vault, Storage) as its own Azure-managed identity; Azure handles the credential, so there's no secret for your app to hold.
```
