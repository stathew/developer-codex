---
title: ASP.NET Core
summary: Microsoft's cross-platform web framework on modern .NET — minimal APIs vs controllers, the middleware pipeline, and hosting with Kestrel and IIS.
difficulty: intermediate
tags: [dotnet, csharp, aspnet-core, backend, iis]
order: 8
related: [design/dependency-injection, backend/spring, frontend/blazor, databases/entity-framework-core]
status: needs-review
reviewNotes: Built from the 2023 .NET Web Framework and IIS stubs (one line each). Updated from .NET Framework-era terminology to ASP.NET Core on modern cross-platform .NET; IIS kept as a hosting option alongside Kestrel.
---

**ASP.NET Core** is the open-source, cross-platform web framework for modern **.NET** (the successor to .NET Framework, which is Windows-only and in maintenance). It builds APIs, server-rendered sites (MVC, Razor Pages) and interactive UI (Blazor).

> [!NOTE]
> ".NET Framework" (up to 4.8.x) and ".NET" (Core, 5 and later) are different platforms. New work should target current .NET; even-numbered releases are long-term support (LTS).

## Minimal APIs vs controllers

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
var app = builder.Build();

// Minimal API: concise, function-based endpoints
app.MapGet("/orders/{id:guid}", async (Guid id, IOrderRepository repo) =>
    await repo.GetAsync(id) is { } order ? Results.Ok(order) : Results.NotFound());

app.Run();
```

**Controllers** (MVC-style classes with attributes) suit larger APIs that want conventions, filters and grouping; **minimal APIs** suit small services and are now the default in templates. Both share routing, DI, model binding and middleware.

## The middleware pipeline

Each request flows through an ordered chain of middleware; each can act before and after calling the next.

```csharp
app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseAuthentication();   // who are you?
app.UseAuthorization();    // are you allowed?
app.MapControllers();
```

Order matters: authentication must run before authorization, and exception handling should be first so it wraps everything.

## Hosting: Kestrel and IIS

- **Kestrel** is ASP.NET Core's built-in, cross-platform web server. Every app runs on it.
- **IIS** (Internet Information Services) is Microsoft's extensible Windows web server. On Windows, apps are often hosted *behind* IIS using the **ASP.NET Core Module**, either in-process or as a reverse proxy to Kestrel.
- On Linux or in containers, Kestrel is typically fronted by NGINX, a cloud load balancer or a Kubernetes ingress.

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: Walk me through what happens when an HTTP request reaches an ASP.NET Core application.
A: **Kestrel** accepts the connection and parses the request into an `HttpContext` (possibly behind IIS, NGINX or a load balancer).
- A **DI scope** is created for the request.
- The request flows through the **middleware pipeline** in order: exception handling, HTTPS redirection, static files, routing, CORS, authentication, authorisation…
- **Routing** selects an endpoint (minimal API handler or controller action); model binding and validation run; filters run for MVC.
- The handler executes (resolving services from DI), produces a result, and the response flows back out through the middleware.
- The scope is disposed — scoped services such as the `DbContext` are cleaned up.

Q: Explain the .NET DI service lifetimes and a bug that mixing them can cause.
A: **Transient**: new instance each resolution. **Scoped**: one per request. **Singleton**: one for the app.
- The classic bug is a **captive dependency**: a singleton depending on a scoped service (e.g. a `DbContext`), which keeps one context alive for the whole app — causing threading errors and stale data.
- Fixes: make the consumer scoped, or create a scope explicitly (`IServiceScopeFactory`) when a singleton genuinely needs scoped work. Scope validation in development catches this.

Q: Minimal APIs or controllers — which would you choose and why?
A: Both share routing, DI, model binding and middleware, so it's mostly about **organisation**.
- **Minimal APIs**: concise, fast to start, great for small services and vertical-slice structures; the default in templates.
- **Controllers**: conventions, filters and grouping that help large APIs with many endpoints and teams used to MVC.
- Either way: keep handlers thin and put logic in services; be consistent within a codebase.

Q: How do you handle errors consistently in an ASP.NET Core API?
A: Centralise it rather than try/catch in every action.
- Exception-handling middleware (`UseExceptionHandler` / `IExceptionHandler`) logs the exception and returns a generic response.
- Return errors as **Problem Details** (RFC 9457) with `AddProblemDetails()` — consistent shape, correct status codes.
- Map known domain errors (not found, validation, conflicts) to 404/400/409 deliberately; never leak stack traces or internal messages in production.
```

```recall
Q: What's the difference between .NET Framework and modern .NET?
A: .NET Framework (≤ 4.8) is Windows-only and in maintenance; modern .NET (Core/5+) is cross-platform, open source and where new development happens.

Q: Why does middleware order matter in ASP.NET Core?
A: Requests pass through middleware in registration order, so e.g. authentication must run before authorization, and exception handling should come first to wrap everything.

Q: What is Kestrel, and how does IIS relate to it?
A: Kestrel is ASP.NET Core's built-in cross-platform web server; on Windows, IIS can host the app via the ASP.NET Core Module, in-process or as a reverse proxy to Kestrel.
```
