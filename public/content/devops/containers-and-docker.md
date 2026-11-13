---
title: Containers & Docker
summary: Packaging an app with everything it needs to run — images, containers, Dockerfiles, multi-stage builds, Compose, security basics and where Kubernetes fits.
difficulty: intermediate
tags: [docker, containers, devops, deployment, kubernetes]
order: 4
related: [devops/git-essentials, backend/aspnet-core, devops/developer-tools-overview]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Application Containerisation stub (no content).
---

A **container** packages an application with its runtime, libraries and configuration into a standard unit that runs the same way on a laptop, in CI and in production. It ends "works on my machine" problems.

**Docker** popularised containers and remains the most common tooling. The underlying formats are standardised by the **OCI** (Open Container Initiative), so images also run under Podman, containerd and Kubernetes.

## Containers vs virtual machines

| | Virtual machine | Container |
| --- | --- | --- |
| Isolation | Full guest OS on a hypervisor | Isolated processes sharing the host **kernel** (Linux namespaces + cgroups) |
| Size | Gigabytes | Megabytes |
| Start-up | Minutes | Seconds or less |
| Isolation strength | Stronger | Weaker (shared kernel) |

## Core concepts

- **Image:** a read-only template built from layers (base OS files, runtime, your app).
- **Container:** a running instance of an image, with a thin writable layer on top.
- **Dockerfile:** instructions for building an image.
- **Registry:** where images are stored and shared (Docker Hub, GitHub Container Registry, Azure Container Registry).
- **Volume:** persistent storage that outlives a container.

## A multi-stage Dockerfile (.NET)

```dockerfile
# Build stage: full SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore                      # cached unless the project file changes
COPY . .
RUN dotnet publish -c Release -o /app

# Runtime stage: small runtime-only image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
USER app                                # don't run as root
EXPOSE 8080
ENTRYPOINT ["dotnet", "Shop.Api.dll"]
```

**Multi-stage builds** keep compilers and source code out of the final image. Ordering instructions from least to most frequently changing makes the best use of **layer caching**.

> [!TIP]
> .NET can build container images without a Dockerfile: `dotnet publish /t:PublishContainer`.

## Everyday commands

```bash
docker build -t shop-api:1.4.0 .
docker run -d -p 8080:8080 --name shop shop-api:1.4.0
docker ps                    # running containers
docker logs -f shop          # follow logs
docker exec -it shop sh      # shell inside the container
docker compose up -d         # start a multi-container app
```

## Docker Compose

**Compose** describes a multi-container app (API, database, cache) in one YAML file. It's ideal for local development and integration tests:

```yaml
services:
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      ConnectionStrings__Shop: "Host=db;Database=shop;Username=shop;Password=dev-only"
    depends_on: [db]
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: dev-only
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```

## Security basics

- Use **small, official base images** (`-alpine`, `-slim`, distroless or chiselled images).
- **Don't run as root.**
- Never bake **secrets** into images. Inject them at runtime from a secret store.
- **Pin versions** (`postgres:17`, or digests) rather than `latest`.
- **Scan images** for vulnerabilities (Trivy, Docker Scout, registry scanning) and rebuild regularly to pick up patches.

## Beyond one machine: orchestration

Running many containers across many machines, with scaling, self-healing, rolling deploys and service discovery, is the job of an **orchestrator**. **Kubernetes** is the standard. Managed alternatives such as Azure Container Apps, AWS ECS/Fargate and Google Cloud Run hide most of its complexity.

```recall
Q: How do containers differ from virtual machines?
A: Containers are isolated processes sharing the host kernel (namespaces + cgroups), making them small and fast to start; VMs run a full guest OS on a hypervisor, with stronger isolation but more overhead.

Q: What's the difference between an image and a container?
A: An image is a read-only, layered template; a container is a running instance of an image with its own writable layer.

Q: Why use a multi-stage Dockerfile?
A: To build with a full SDK image but ship only the compiled output on a small runtime image, reducing size and attack surface.

Q: Name three container security basics.
A: Small official base images, running as a non-root user, keeping secrets out of images (also: pin versions and scan for vulnerabilities).

Q: What is Kubernetes for?
A: Orchestrating containers across many machines: scheduling, scaling, self-healing, rolling deployments and service discovery.
```
