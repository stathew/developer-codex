# Legacy content migration (2023 Docusaurus codex → Developer Codex)

Source: [`stathew/developer-codex-docusaurus`](https://github.com/stathew/developer-codex-docusaurus) `docs/` (59 files, ~2,300 words). Migrated 2026-11-13.

Every entry created or changed from legacy notes has `status: needs-review` in its front matter plus a `reviewNotes` line explaining what changed. The app shows these with a **Needs review** badge and banner, and **Explore → Any status → Needs review** lists them all. Once you've checked an entry, delete its `status` and `reviewNotes` lines.

## What happened to each legacy file

### Imported as new entries

| Legacy file | New entry | Key corrections |
| --- | --- | --- |
| Programming Concepts/OOP.md | `design/object-oriented-programming` | Encapsulation/abstraction rewritten (originals inaccurate); abstract class vs interface updated for default interface methods; empty sections filled |
| Principles/SOLID Principles.md | `design/solid-principles` | **DIP was wrong** (described the caller creating dependencies, i.e. injection); OCP no longer inheritance-only |
| Principles/DRY.md | `design/dry-principle` | Added knowledge-vs-code distinction, rule of three |
| Design Patterns/Dependency Injection.md | `design/dependency-injection` | Rewritten (text closely matched a published tutorial); lifetimes, containers added |
| Design Patterns/Factory.md | `design/factory-pattern` | ShapeFactory example implemented; variants explained |
| Design Patterns/Singleton.md | `design/singleton-pattern` | Thread-safe impl, drawbacks, DI alternative |
| Design Patterns/Strategy Design.md | `design/strategy-pattern` | Rewritten (intent text matched Wikipedia) |
| Design Patterns/Decorator Pattern.md | `design/decorator-pattern` | Intent kept; example added |
| Design Patterns/Model-View-Controller.md | `design/model-view-controller` | Not a web-only pattern (Smalltalk origin) |
| Misc/JWT.md | `backend/json-web-tokens` | Rewritten (closely followed jwt.io intro); unfinished structure section completed |
| Misc/OAuth.md | `backend/oauth-and-openid-connect` | **Roles were wrong** (resource owner = user); OAuth ≠ login (OIDC); OAuth 1.0 legacy; OAuth 2.1/PKCE |
| Misc/Swagger.md | `backend/openapi-and-swagger` | Spec renamed OpenAPI in 2016; .NET 9+ uses Microsoft.AspNetCore.OpenApi |
| Programming Concepts/Web Hooks.md | `backend/webhooks` | Security, retries, idempotency added |
| Misc/Gateway API.md | `backend/api-gateway` | Renamed to *API Gateway* (Kubernetes "Gateway API" is a different thing) |
| Frameworks/Web Back-End Frameworks/dotNET.md + Misc/IIS.md | `backend/aspnet-core` | .NET Framework → modern .NET/ASP.NET Core; IIS as hosting option |
| Frameworks/Architecture Frameworks/Entity Framework.md (+ EF Core.md, ORM.md stubs) | `databases/entity-framework-core` | EF6 is legacy → EF Core |
| Programming Concepts/Async Await.md | `fundamentals/async-await` | Expanded from one sentence |
| Tools/Version Control/Conventional Commits.md | `devops/conventional-commits` | Expanded |
| Interview Practice/Common Questions.md | `career/technical-interview-questions` | Most answers were placeholders ("An class.") — written fresh; abstract-class "security" claim removed |
| Interview Practice/Examples of Experience.md | `career/talking-about-your-experience` | STAR method + question bank added; "idea of success" moved here as a personal prompt |
| Interview Practice/Questions for the Interviewer.md | `career/questions-for-the-interviewer` | Your text kept nearly verbatim; empty answers filled |
| Interview Practice/Coding Questions/FizzBuzz.js + Technical Tests.md | `career/coding-exercises` | **FizzBuzz bug fixed** (looped 0–99, implicit globals); linked-list and tree solutions added |

### Merged into existing entries

| Legacy file | Merged into | Notes |
| --- | --- | --- |
| Protocols/RESTful.md | `backend/rest-api-design` → "What makes an API RESTful" | RFC 2616 obsolete (now RFC 9110); REST is a style, not "a subset of HTTP"; PUT/POST semantics corrected; `x-wbe+xml` typo dropped |
| Common Questions.md (clustered index answer) | `databases/indexes` → "Clustered vs non-clustered indexes" | PK is clustered *by default* only; "physical order" qualified |

### Already covered by new entries (empty in legacy)

- Misc/BigONotation.md → `fundamentals/big-o-notation`
- Tools/Version Control/Git.md → `devops/git-essentials`

### Backlog filled since migration

- **Design patterns** (2026-11-13): Adapter, Builder, Observer, Proxy, Repository, Rules, Template Method → `design/*-pattern`, plus a `design/design-patterns-overview` hub. Drafted fresh (the legacy files were empty templates) and flagged `needs-review`.
- **Testing** (2026-11-13): Automated Testing, Unit Testing, Test Cases and Test-Driven Development → new `testing/` category (Testing & Quality). TDD moved here from Development Lifecycle. Flagged `needs-review`.
- **Protocols** (2026-11-13): SOAP, gRPC and GraphQL (GraphQL was filed under Misc) → `backend/`, plus a `backend/api-styles-compared` hub. Flagged `needs-review`.

### Not imported — empty or heading-only (content backlog)

These existed only as titles or empty templates. They're good candidates for new entries:

- **Databases:** Databases Overview, Relational Databases
- **Development lifecycle:** Agile, Waterfall, Event-Driven Development
- **Frameworks:** Angular, React, Blazor, Spring
- **Misc:** Application Containerisation, WebAssembly, Domain-Driven Design, Generics
- **Tools:** Tools Overview, SVN
- **Interview practice:** Algorithm Questions

The Docusaurus scaffolding (blog, `src/`, config, starter images) wasn't migrated.
