---
title: Choosing Azure Compute
summary: App Service, Azure Functions, Container Apps, AKS and VMs compared — what each hosts well, and how to decide between them.
difficulty: intermediate
tags: [azure, cloud, architecture]
order: 0
related: [azure/azure-app-service, azure/azure-functions, devops/containers-and-docker, design/system-design-fundamentals]
status: needs-review
reviewNotes: New entry opening the Azure category. Service names and tier facts checked against current Microsoft Learn guidance on 2026-11-21.
---

Azure has five mainstream ways to run your code, trading off control for convenience. Most real systems use more than one.

## At a glance

| | App Service | Azure Functions | Container Apps | AKS | Virtual Machines |
| --- | --- | --- | --- | --- | --- |
| **Unit** | A web app | A function, triggered by an event | A container, scaled by KEDA | A Kubernetes cluster | A VM you manage |
| **Scales to zero** | No (always-on instances) | Yes (Consumption plan) | Yes | No (nodes keep running) | No |
| **You manage** | Nothing below the app | Nothing | The container image | Nodes, networking, upgrades | Everything |
| **Best for** | Web apps and APIs | Event-driven, bursty, scheduled work | Microservices, event-driven containers, scale-to-zero | Complex multi-service systems, existing Kubernetes skills | Legacy apps, full OS control, licensing needs |

## App Service: the default for a web app or API

[Azure App Service](azure-app-service.md) hosts a web app or API with almost nothing to manage: no servers, no container orchestration, built-in scaling, deployment slots, managed TLS. Start here for an ASP.NET Core API or an Angular app's backend unless you have a specific reason not to.

## Azure Functions: event-driven and serverless

[Azure Functions](azure-functions.md) runs code in response to triggers — an HTTP call, a queue message, a timer — and the **Consumption** plan scales to zero and bills per execution. Good for webhooks, scheduled jobs, and processing messages from a queue.

## Container Apps: containers without the Kubernetes bill

**Azure Container Apps** runs containers with automatic scaling (including to zero) driven by KEDA, built-in Dapr integration for service-to-service calls and pub/sub, and no cluster to patch or upgrade. It sits between App Service (too opinionated for arbitrary containers) and AKS (more control than most teams need). Good default for containerised microservices.

## AKS: full Kubernetes

**Azure Kubernetes Service** is a managed Kubernetes control plane; you still manage node pools, networking policies, upgrades and the add-ons you choose. Reach for it when you need Kubernetes-specific features (custom operators, service meshes, very fine-grained scheduling), already run Kubernetes elsewhere, or need portability across clouds. It's more operational overhead than Container Apps for a typical web system.

## Virtual Machines: full control

Azure VMs are the least abstracted option: you patch the OS, install the runtime, manage scaling yourself (or via a VM Scale Set). Still the right choice for software that needs OS-level access, specific licensing (SQL Server on a VM is common for Windows Server-level control — see [Azure SQL Database](azure-sql-database.md) for the managed alternative), or lift-and-shift migrations where re-architecting isn't yet an option.

## A decision path

1. **Is it a container you already build?** Container Apps, unless you specifically need Kubernetes → then AKS.
2. **Is it event-driven, bursty, or mostly idle?** Functions.
3. **Is it a conventional web app or API, always running?** App Service.
4. **Do you need OS-level control or specific licensing?** A VM.

> [!TIP]
> These aren't mutually exclusive. A common shape: an Angular SPA on static hosting or App Service, an ASP.NET Core API on App Service, background processing on Functions, and Azure SQL Database underneath.

```recall
Q: Which Azure compute option scales to zero and bills per execution?
A: Azure Functions on a Consumption plan.

Q: When would you choose Container Apps over AKS?
A: When you want to run containers with autoscaling (including to zero) without managing a Kubernetes control plane, nodes or upgrades yourself — AKS is for when you specifically need Kubernetes features or portability.

Q: What's the simplest Azure option for hosting a conventional, always-on web API?
A: Azure App Service.
```
