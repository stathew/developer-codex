---
title: Model–View–Controller (MVC)
summary: Separating data, presentation and input handling — how MVC works in server-side web frameworks, routing, and how it relates to MVVM and component frameworks.
difficulty: beginner
tags: [architecture, design-patterns, aspnet-core, web]
order: 30
related: [backend/aspnet-core, design/solid-principles]
status: needs-review
reviewNotes: Imported from the 2023 MVC note. Kept the Model/View/Controller/Routes definitions; corrected "web development pattern" (MVC originated in Smalltalk desktop GUIs in the late 1970s) and added an ASP.NET Core example plus MVVM comparison.
---

**Model–View–Controller** splits an application into three roles so that each can change independently. It originated in Smalltalk desktop GUIs in the late 1970s and was later adopted by server-side web frameworks such as Ruby on Rails, ASP.NET MVC and Spring MVC.

## The three roles

- **Model** — the data and the rules that operate on it (entities, domain logic, data access).
- **View** — the presentation: renders model data for the user (HTML templates, Razor views).
- **Controller** — handles input: receives a request, works with the model, picks a view to render.

## Routing

In web MVC, a **route** maps a URL to a controller action. Controllers commonly use attributes to declare which routes they handle:

```csharp
[Route("products")]
public class ProductsController(IProductRepository products) : Controller
{
    [HttpGet("{id:int}")]                     // GET /products/42
    public async Task<IActionResult> Details(int id)
    {
        var product = await products.GetAsync(id);      // Model
        return product is null ? NotFound() : View(product);  // View
    }
}
```

## Keep controllers thin

Business rules belong in the model or services, not controllers. A controller doing validation, calculations and persistence is hard to test and reuse — a classic Single Responsibility problem.

## MVC and its relatives

| Pattern | Where you see it | Key idea |
| --- | --- | --- |
| MVC | Server-rendered web apps | Controller handles input, chooses view |
| MVP | Older desktop/Android apps | Presenter drives a passive view |
| MVVM | WPF, MAUI, Knockout | View binds to a ViewModel's state |
| Component-based | Angular, React, Blazor | UI = tree of components owning their template and state |

```recall
Q: What are the responsibilities of the Model, View and Controller?
A: Model: data and business rules. View: presentation. Controller: handles input/requests, coordinates the model and selects a view.

Q: Where did MVC originate?
A: In Smalltalk desktop GUI development in the late 1970s, before being adopted by web frameworks.

Q: Why keep controllers thin?
A: Business logic in controllers is hard to test and reuse; it belongs in the model or service layer.
```
