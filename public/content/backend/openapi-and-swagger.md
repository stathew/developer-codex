---
title: OpenAPI & Swagger
summary: Describing HTTP APIs with the OpenAPI Specification, the Swagger tooling around it, and design-first vs code-first workflows.
difficulty: beginner
tags: [api, openapi, swagger, documentation, backend]
order: 5
related: [backend/rest-api-design, backend/aspnet-core]
status: needs-review
reviewNotes: Imported from the 2023 Swagger note. Updated terminology (the specification has been called OpenAPI since 2016; Swagger now refers to SmartBear tooling) and noted that .NET 9+ templates use Microsoft.AspNetCore.OpenApi instead of Swashbuckle.
---

The **OpenAPI Specification** is a machine-readable format (YAML or JSON) for describing HTTP APIs: endpoints, parameters, request and response schemas, authentication and errors.

## OpenAPI vs Swagger

The specification *was* called Swagger until 2016, when it was donated to the Linux Foundation and renamed **OpenAPI**. Today:

- **OpenAPI** = the specification (current major line: 3.x).
- **Swagger** = a family of tools built around it: Swagger UI (interactive docs), Swagger Editor, Swagger Codegen.

## A small example

```yaml
openapi: 3.1.0
info: { title: Orders API, version: 1.0.0 }
paths:
  /orders/{id}:
    get:
      summary: Get an order
      parameters:
        - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
      responses:
        '200':
          description: The order
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Order' }
        '404': { description: Not found }
components:
  schemas:
    Order:
      type: object
      required: [id, total]
      properties:
        id: { type: string, format: uuid }
        total: { type: number }
```

## What a spec gives you

- **Interactive documentation** (Swagger UI, Redoc, Scalar).
- **Generated clients** in TypeScript, C#, Java, … so consumers never hand-write HTTP calls.
- **Validation and contract tests** — check requests and responses against the spec.
- **Mock servers** so frontend work can start before the backend exists.

## Design-first vs code-first

- **Design-first** — write the spec, review it, then implement. Best for public or cross-team APIs.
- **Code-first** — generate the spec from code annotations. Faster for internal APIs; keep it honest with contract tests.

> [!NOTE]
> In ASP.NET Core, new projects from .NET 9 onwards use `Microsoft.AspNetCore.OpenApi` (`builder.Services.AddOpenApi()`) to generate the document instead of the Swashbuckle package; pair it with any UI such as Scalar or Swagger UI.

```recall
Q: What's the difference between OpenAPI and Swagger today?
A: OpenAPI is the specification for describing HTTP APIs; Swagger is a set of tools (UI, Editor, Codegen) built around it.

Q: Name three things you can generate or do from an OpenAPI document.
A: Interactive docs, client SDKs, mock servers (also request/response validation and contract tests).

Q: When is design-first preferable to code-first?
A: For public or cross-team APIs, where the contract should be agreed and reviewed before implementation.
```
