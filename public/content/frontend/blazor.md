---
title: Blazor
summary: Building interactive web UIs in C# instead of JavaScript — Razor components, render modes (static SSR, Server, WebAssembly, Auto) and their trade-offs.
difficulty: intermediate
tags: [blazor, dotnet, csharp, frontend, webassembly]
order: 6
related: [frontend/choosing-a-frontend-framework, backend/aspnet-core, frontend/angular]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Blazor stub (no content). Render-mode details reflect the unified Blazor model introduced in .NET 8; check against current ASP.NET Core docs.
---

**Blazor** is Microsoft's framework for building interactive web UIs with **C# and Razor** instead of JavaScript. It's part of ASP.NET Core and appeals most to .NET teams who want to share code, types and skills between the frontend and the backend.

## Razor components

UI is built from **components**: `.razor` files that mix HTML markup with C#.

```razor
@* ProductCard.razor *@
<div class="card">
    <h3>@Product.Name</h3>
    @if (Product.InStock)
    {
        <button @onclick="() => OnAdd.InvokeAsync(Product)">Add to basket</button>
    }
    else
    {
        <span>Out of stock</span>
    }
</div>

@code {
    [Parameter, EditorRequired] public Product Product { get; set; } = default!;
    [Parameter] public EventCallback<Product> OnAdd { get; set; }
}
```

- **Parameters** pass data down; **EventCallbacks** pass events up.
- Lifecycle methods include `OnInitializedAsync` and `OnParametersSetAsync`.
- Services come in through dependency injection (`@inject IProductService Products`).
- `@bind` gives two-way binding for forms, with `EditForm` and validation built in.

## Render modes

The key Blazor concept is **where your component runs**. Since .NET 8 you choose a render mode per page or per component:

| Render mode | Where C# runs | How the UI updates | Trade-offs |
| --- | --- | --- | --- |
| **Static SSR** | Server, once per request | Full HTML response, no interactivity (forms still post) | Fastest and simplest; no client-side events |
| **Interactive Server** | Server | UI events and DOM diffs over a persistent **SignalR** connection | Instant start and small download; every interaction needs a round trip; server holds per-user state (a "circuit") |
| **Interactive WebAssembly** | Browser, on a .NET runtime compiled to WebAssembly | Locally, like a JS SPA | Works offline and scales freely; larger initial download and slower first load |
| **Interactive Auto** | Server first, then WebAssembly once downloaded | Starts on SignalR, switches to WASM on later visits | Best of both, at the cost of more complexity |

```razor
@page "/basket"
@rendermode InteractiveServer
```

> [!WARNING]
> **Interactive Server** keeps state per user on the server and needs a stable connection. Latency affects every click, and a dropped connection disrupts the session. Plan for reconnection and for sticky sessions or Azure SignalR Service when scaling out.

## JavaScript interop

Blazor can call JavaScript, and JavaScript can call .NET, through `IJSRuntime`. You'll still need it for browser APIs and existing JS libraries.

## Beyond the browser

**Blazor Hybrid** hosts the same Razor components inside native desktop and mobile apps, through .NET MAUI, WPF or WinForms.

## Strengths and trade-offs

| Strengths | Trade-offs |
| --- | --- |
| C# end to end; share models and validation with the API | Smaller ecosystem than React or Angular |
| Strong tooling in Visual Studio and Rider | WebAssembly download size and startup time |
| Flexible render modes, including SEO-friendly SSR | Server mode depends on latency and a persistent connection |
| Great fit for internal and line-of-business apps | Fewer front-end specialists know it |

```recall
Q: What are Blazor's four render modes?
A: Static SSR, Interactive Server, Interactive WebAssembly and Interactive Auto.

Q: How does Interactive Server mode update the UI?
A: Components run on the server; UI events and DOM diffs travel over a persistent SignalR connection.

Q: What's the main trade-off of Interactive WebAssembly?
A: It runs fully in the browser (offline-capable, no server round trips) but has a larger initial download and slower first load.

Q: What is Blazor Hybrid?
A: Running Razor components inside native desktop/mobile apps via .NET MAUI, WPF or WinForms.
```
