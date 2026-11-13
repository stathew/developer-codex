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

```recall
Q: What's the difference between .NET Framework and modern .NET?
A: .NET Framework (≤ 4.8) is Windows-only and in maintenance; modern .NET (Core/5+) is cross-platform, open source and where new development happens.

Q: Why does middleware order matter in ASP.NET Core?
A: Requests pass through middleware in registration order, so e.g. authentication must run before authorization, and exception handling should come first to wrap everything.

Q: What is Kestrel, and how does IIS relate to it?
A: Kestrel is ASP.NET Core's built-in cross-platform web server; on Windows, IIS can host the app via the ASP.NET Core Module, in-process or as a reverse proxy to Kestrel.
```
