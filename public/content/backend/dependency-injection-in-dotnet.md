---
title: Dependency Injection in .NET
summary: Configuring the built-in DI container in practice — lifetimes in depth, the Options pattern, keyed services, decorators, and validating your service graph.
difficulty: advanced
tags: [dotnet, csharp, aspnet-core, dependency-injection]
order: 16
related: [design/dependency-injection, backend/aspnet-core, testing/dotnet-testing-xunit-and-integration-tests]
status: needs-review
reviewNotes: New entry in the C#/.NET batch — the container-mechanics depth beyond the generic design/dependency-injection pattern entry. Keyed services (added .NET 8) checked against current Microsoft Learn docs on 2026-11-21.
---

[Dependency Injection](../design/dependency-injection.md) covers the pattern and the lifetimes at a conceptual level. This entry is the practical depth: how `IServiceCollection` actually behaves day to day.

## Registration patterns

```csharp
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();

// TryAdd*: register only if nothing already registered this service — useful in shared
// extension methods so a consumer's own registration always wins
builder.Services.TryAddScoped<IClock, SystemClock>();

// A factory when construction needs more than the container can infer
builder.Services.AddSingleton<IConfiguration>(sp => sp.GetRequiredService<IConfiguration>());

// Registering a concrete type against multiple interfaces it implements
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<IOrderReader>(sp => sp.GetRequiredService<OrderService>());
```

## Keyed services (.NET 8+)

For registering several implementations of the same interface and choosing between them at the injection site, rather than by type:

```csharp
builder.Services.AddKeyedSingleton<IPaymentGateway, StripeGateway>("stripe");
builder.Services.AddKeyedSingleton<IPaymentGateway, PayPalGateway>("paypal");

public class CheckoutService([FromKeyedServices("stripe")] IPaymentGateway gateway) { }
```

Before .NET 8, the common workaround was an `IEnumerable<IPaymentGateway>` resolved and filtered by a discriminator property — keyed services make the common case explicit instead.

## The Options pattern

Don't inject `IConfiguration` directly into business logic — bind a strongly-typed, validated options class instead:

```csharp
public class PaymentOptions
{
    public required string ApiKey { get; set; }
    [Range(1, 300)] public int TimeoutSeconds { get; set; } = 30;
}

builder.Services
    .AddOptions<PaymentOptions>()
    .Bind(builder.Configuration.GetSection("Payment"))
    .ValidateDataAnnotations()
    .ValidateOnStart();   // fail at startup, not on first use, if config is invalid
```

| Inject | Behaviour |
| --- | --- |
| `IOptions<T>` | Resolved once, cached for the app's lifetime — won't see config changes |
| `IOptionsSnapshot<T>` | Re-read per scope (e.g. per request) — picks up config reloads, scoped lifetime |
| `IOptionsMonitor<T>` | Always current, plus an `OnChange` callback — usable from a singleton |

## Decorators: adding behaviour without changing the registration

```csharp
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.Decorate<IOrderRepository, CachingOrderRepository>();   // Scrutor package
```

The built-in container has no first-class decoration API; the **Scrutor** package adds `Decorate`, implementing the [Decorator pattern](../design/decorator-pattern.md) without hand-wiring the wrapping yourself.

## Validating the service graph

Catch captive-dependency and missing-registration bugs at startup, in development, rather than at an unpredictable moment in production:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseDefaultServiceProvider((context, options) =>
{
    options.ValidateScopes = context.HostingEnvironment.IsDevelopment();   // catches captive dependencies
    options.ValidateOnBuild = context.HostingEnvironment.IsDevelopment(); // catches missing registrations
});
```

> [!TIP]
> Turn both of these on in development and CI, even though the extra checking cost isn't worth paying in production. A captive dependency — a singleton holding a scoped service — is exactly the kind of bug that's silent in simple testing and expensive to diagnose once it's live.

## Testing with DI

A fake or stub implementation registered in a test host, rather than real infrastructure, is what makes [unit and integration testing](../testing/dotnet-testing-xunit-and-integration-tests.md) practical for anything wired through the container — see that entry for `WebApplicationFactory` and overriding registrations per test.

```recall
Q: What does TryAddScoped do differently from AddScoped?
A: It only registers the service if nothing is already registered for that type, which lets shared extension methods provide a default without overriding a consumer's own registration.

Q: What problem do keyed services (.NET 8+) solve?
A: Registering multiple implementations of the same interface and selecting a specific one at the injection site by key, instead of by type or by filtering an IEnumerable.

Q: What's the difference between `IOptions<T>` and `IOptionsMonitor<T>`?
A: `IOptions<T>` is resolved once and cached for the app's lifetime; `IOptionsMonitor<T>` always reflects current configuration and can notify on change, making it usable from a singleton.

Q: What do ValidateScopes and ValidateOnBuild catch, and when should you enable them?
A: ValidateScopes catches captive dependencies (a longer-lived service holding a shorter-lived one); ValidateOnBuild catches missing registrations at startup. Enable both in development/CI; the extra cost isn't worth paying in production.
```
