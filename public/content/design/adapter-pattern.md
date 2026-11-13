---
title: Adapter Pattern
summary: Make an existing class fit the interface your code expects by wrapping it in a translator — the go-to pattern for integrating third-party and legacy code.
difficulty: beginner
tags: [design-patterns, structural, oop, integration]
order: 15
related: [design/decorator-pattern, design/proxy-pattern, design/dependency-injection]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Adapter stub (title only). Follows the original Names / Intent / Motivation template.
---

**Type:** structural · **Also known as:** Wrapper, Translator.

**Intent:** convert the interface of an existing class into the interface clients expect, so classes that couldn't otherwise work together can.

## Motivation

Your app depends on its own `IPaymentGateway` abstraction. You need to add a new provider whose SDK has a completely different shape. Rather than spreading that SDK through your codebase, write an **adapter** that implements *your* interface by calling *theirs*.

```csharp
// The interface your application owns
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(decimal amount, string currency, string customerId);
}

// The third-party SDK — you can't change it
public class AcmePayClient
{
    public Task<AcmeChargeResponse> CreateCharge(AcmeChargeRequest request) { /* … */ }
}

// The adapter translates between the two
public class AcmePayAdapter(AcmePayClient client) : IPaymentGateway
{
    public async Task<PaymentResult> ChargeAsync(decimal amount, string currency, string customerId)
    {
        var response = await client.CreateCharge(new AcmeChargeRequest
        {
            AmountInMinorUnits = (long)(amount * 100),   // their API wants pennies
            Currency = currency.ToUpperInvariant(),
            Customer = customerId,
        });
        return response.Status == "succeeded"
            ? PaymentResult.Success(response.Id)
            : PaymentResult.Failed(response.FailureMessage);
    }
}
```

The rest of the application only knows `IPaymentGateway`. Switching providers later means writing another adapter, not touching every caller.

## When to use it

- Integrating a **third-party library or API** whose types you don't want leaking into your domain.
- Wrapping **legacy code** behind a modern interface during a migration.
- Making several similar-but-different services (storage providers, SMS gateways) look identical.

> [!TIP]
> Adapters are a natural home for **anti-corruption** logic: unit conversions, mapping error codes, renaming awkward fields. Keep that translation in one place so it doesn't spread.

## Adapter vs its neighbours

| Pattern | Interface it exposes | Purpose |
| --- | --- | --- |
| **Adapter** | A *different* interface from the wrapped object | Make incompatible things fit |
| **Decorator** | The *same* interface | Add behaviour |
| **Proxy** | The *same* interface | Control access |
| **Facade** | A *simpler* interface over many objects | Hide a complex subsystem |

```recall
Q: What problem does the Adapter pattern solve?
A: It lets a class with an incompatible interface be used where another interface is expected, by wrapping it in a translator that implements the expected interface.

Q: How does an Adapter differ from a Decorator?
A: An Adapter exposes a different interface from the object it wraps (to make it fit); a Decorator exposes the same interface (to add behaviour).

Q: Why wrap a third-party SDK in an adapter instead of calling it directly?
A: It keeps the SDK's types and quirks out of your domain, centralises translation logic, and makes swapping providers a matter of writing a new adapter.
```
