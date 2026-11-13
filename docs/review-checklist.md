# Review checklist

57 entries are flagged `status: needs-review`. This checklist lists the **specific claims to verify** in each one, so a review means checking facts rather than re-reading everything cold.

## How to review an entry

For every entry, on top of its specific items below:

- [ ] Read it through once; does it match your understanding and experience?
- [ ] Code samples look right for the language and version you use
- [ ] Recall cards: answers are correct and each tests one idea
- [ ] Delete the `status: needs-review` and `reviewNotes` lines from the front matter

When an item is wrong, fix the entry (or note it and ask Claude to fix it). The ⚠ marker means **"most likely to be wrong or out of date"**; check those against the linked primary source rather than from memory.

## Suggested order

1. **Tier 1: corrections to your original notes (8 entries).** I changed what you'd written, so make sure you agree.
2. **Tier 2: version-sensitive (11 entries).** These are the most likely to drift; check against current docs.
3. **Tier 3: conceptual (38 entries).** These are stable topics, and a lighter read is usually enough.

---

## Tier 1: corrections to your original notes

### SOLID Principles — `design/solid-principles`
- [ ] You agree with the **Dependency Inversion** rewrite: "both depend on abstractions", not "the calling class creates the dependency" (your original described dependency injection)
- [ ] Open/Closed: you're happy with "usually via interfaces/composition" rather than "add features using inheritance"
- [ ] SRP framed as "one reason to change", tied to a stakeholder/concern
- [ ] Square/Rectangle as the Liskov example

### OAuth 2.0 & OpenID Connect — `backend/oauth-and-openid-connect`
- [ ] ⚠ Roles: **resource owner = the user** (your original said the provider, e.g. Amazon)
- [ ] OAuth is authorisation; sign-in is **OpenID Connect**
- [ ] ⚠ Implicit and Resource Owner Password flows deprecated; OAuth 2.1 requires PKCE for all authorization-code clients — check status at [oauth.net/2.1](https://oauth.net/2.1/)
- [ ] OAuth 1.0 described as legacy
- [ ] The five PKCE steps are in the right order

### Object-Oriented Programming — `design/object-oriented-programming`
- [ ] Encapsulation and abstraction rewritten (your originals said objects "communicate automatically"); you agree with the new definitions
- [ ] Your Animal / Pig / Cat `Speak()` example kept for polymorphism
- [ ] ⚠ Abstract class vs interface table: interfaces can have **default method bodies since C# 8 / Java 8**
- [ ] Overloading described as compile-time ("ad-hoc") polymorphism

### Technical Interview Questions — `career/technical-interview-questions`
- [ ] Most answers were placeholders ("An class.") and are newly written. Read each answer as **your** answer: would you say it this way?
- [ ] Abstract class answer: "used to achieve security" removed
- [ ] Clustered index answer: "PK is clustered **by default** in SQL Server, can be declared non-clustered"
- [ ] Secure-development answer: the list matches what you'd want to say in an interview

### Coding Exercises — `career/coding-exercises`
- [ ] FizzBuzz fix: loop `1..100` (your original ran `0..99` with undeclared globals)
- [ ] "Reverse Binary Tree" from your notes interpreted as **invert** (mirror) a binary tree
- [ ] Complexities: reverse list O(n) time / O(1) space; invert tree O(n) time / O(h) space
- ✅ Code samples were executed and pass tests

### REST API Design — `backend/rest-api-design` (merged your RESTful note)
- [ ] ⚠ HTTP semantics now in **RFC 9110**; RFC 2616 obsolete
- [ ] REST described as an architectural style (Fielding, 2000), not "a subset of HTTP"
- [ ] PUT vs POST explained by idempotency and who chooses the URL, not "update vs create"
- [ ] Your `application/x-wbe+xml` was dropped as a typo
- [ ] Status code list and RFC 9457 Problem Details reference

### Database Indexes — `databases/indexes` (merged your clustered-index answer)
- [ ] Clustered vs non-clustered section: "at most one clustered per table", PK clustered by default only
- [ ] "Physically sorted on disk" qualified as a simplification
- [ ] ⚠ PostgreSQL described as having no persistent clustered index (heap tables; `CLUSTER` is one-off)
- [ ] Clustered key advice: narrow, unique, static, ever-increasing; random GUIDs cause fragmentation

### JSON Web Tokens — `backend/json-web-tokens` (rewritten from jwt.io text)
- [ ] Structure: header.payload.signature, base64url
- [ ] HS256 (shared secret) vs RS256/ES256 (key pair) guidance
- [ ] Validation list: pin the algorithm, `exp`/`nbf`, `iss`, `aud`
- [ ] The example uses `//` comments inside a JSON block for annotation (not valid JSON); acceptable?

---

## Tier 2: version-sensitive

### Angular — `frontend/angular`
- [ ] ⚠ Standalone components are the default; NgModules not needed
- [ ] ⚠ Built-in control flow (`@if`, `@for`, `@switch`, `@defer`)
- [ ] ⚠ New apps run **zoneless** by default
- [ ] ⚠ Major release every ~6 months, **18 months support** — check [angular.dev/reference/releases](https://angular.dev/reference/releases)
- [ ] AngularJS (1.x) end-of-life; Angular (2+, 2016) a rewrite

### React — `frontend/react`
- [ ] ⚠ **Create React App deprecated**; frameworks (Next.js, React Router) recommended; Vite for client-only — check [react.dev](https://react.dev/learn/creating-a-react-app)
- [ ] ⚠ React Compiler described as adding memoisation automatically at build time
- [ ] Server Components "available through frameworks"
- [ ] Open-sourced 2013; hooks table; rules of hooks

### Blazor — `frontend/blazor`
- [ ] ⚠ Four render modes as introduced in **.NET 8**: Static SSR, Interactive Server, Interactive WebAssembly, Interactive Auto
- [ ] ⚠ `@rendermode InteractiveServer` syntax
- [ ] Interactive Server scaling advice (sticky sessions / Azure SignalR Service)
- [ ] Blazor Hybrid via .NET MAUI, WPF, WinForms

### Spring & Spring Boot — `backend/spring`
- [ ] ⚠ Spring Boot 3: Java 17 baseline, `javax.*` → `jakarta.*`
- [ ] ⚠ Spring Boot 4 built on Spring Framework 7 — check [spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
- [ ] `@Transactional` self-invocation pitfall (proxy bypass)
- [ ] Virtual threads supported (Java 21+)

### ASP.NET Core — `backend/aspnet-core`
- [ ] ⚠ Minimal APIs "now the default in templates"
- [ ] ⚠ "Even-numbered .NET releases are LTS" — check [dotnet.microsoft.com support policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core)
- [ ] Middleware order example (exception handler first, authn before authz)
- [ ] IIS hosting via the ASP.NET Core Module (in-process or out-of-process)

### OpenAPI & Swagger — `backend/openapi-and-swagger`
- [ ] Spec renamed from Swagger to OpenAPI in 2016; current line 3.x (example uses 3.1.0)
- [ ] ⚠ **.NET 9+ templates use `Microsoft.AspNetCore.OpenApi`** instead of Swashbuckle

### ORMs & Entity Framework Core — `databases/entity-framework-core`
- [ ] EF6 described as maintenance-mode, EF Core for new work
- [ ] `dotnet ef` migration commands
- [ ] ⚠ `LogTo(Console.WriteLine)` for SQL logging

### Unit Testing — `testing/unit-testing`
- [ ] ⚠ "Vitest is Angular's default test runner **since v21**"
- [ ] Test-double taxonomy (dummy / stub / fake / spy / mock)
- [ ] NSubstitute example syntax

### Containers & Docker — `devops/containers-and-docker`
- [ ] ⚠ Dockerfile uses `mcr.microsoft.com/dotnet/sdk:10.0` / `aspnet:10.0` and `USER app`; check current tags
- [ ] ⚠ `dotnet publish /t:PublishContainer` builds images without a Dockerfile
- [ ] Compose example uses `postgres:17`; the `dev-only` password is clearly a placeholder

### Choosing a Frontend Framework — `frontend/choosing-a-frontend-framework`
- [ ] ⚠ Comparison table: reactivity models (Svelte "runes", Vue proxies/refs), SSR frameworks
- [ ] "Industry converging on signals" claim
- [ ] Hiring-market statements are fair for your region

### Developer Tools Overview — `devops/developer-tools-overview`
- [ ] ⚠ Tool lists are examples and will date; prune to what **you** actually use or recommend
- [ ] `.http` file support claims (Visual Studio, Rider, VS Code extension)

---

## Tier 3: conceptual

### Fundamentals

**Async / Await** — `fundamentals/async-await`
- [ ] `await` doesn't block the thread; async ≠ parallel
- [ ] C# pitfalls: `.Result`/`.Wait()` deadlocks, `async void`
- [ ] JS pitfall: `forEach(async …)` doesn't wait

**Generics** — `fundamentals/generics`
- [ ] Variance: covariance `out` / `? extends`, contravariance `in` / `? super`, PECS
- [ ] C# reified vs Java erasure vs TypeScript compile-time only
- [ ] TypeScript `pluck<T, K extends keyof T>` example

### Software Design

**DRY** — `design/dry-principle`
- [ ] Pragmatic Programmer quote and attribution (Hunt & Thomas, 1999)
- [ ] Sandi Metz quote wording ("duplication is far cheaper than the wrong abstraction")

**Design Patterns Overview** — `design/design-patterns-overview`
- [ ] GoF: 1994, 23 patterns, three families; authors' names
- [ ] Every pattern is placed in the right family

**Dependency Injection** — `design/dependency-injection`
- [ ] .NET lifetimes table (transient / scoped / singleton) and the captive-dependency warning
- [ ] "Scope validation catches captive dependencies in development"

**Factory** — `design/factory-pattern`
- [ ] Simple factory "not a GoF pattern"; Factory Method vs Abstract Factory distinction

**Singleton** — `design/singleton-pattern`
- [ ] `Lazy<T>` thread-safe implementation; your GameState example kept

**Strategy** — `design/strategy-pattern`
- [ ] "Also known as Policy"; functions-as-strategies tip

**Decorator** — `design/decorator-pattern`
- [ ] Your intent text kept; examples (Java I/O, .NET Streams, `DelegatingHandler`)
- [ ] Note that TS/Python `@decorator` syntax ≠ GoF Decorator

**Adapter** — `design/adapter-pattern`
- [ ] Comparison table vs Decorator / Proxy / Facade

**Builder** — `design/builder-pattern`
- [ ] Fluent builder and test-data-builder examples

**Observer** — `design/observer-pattern`
- [ ] Observer vs pub/sub distinction; signals as a variation

**Proxy** — `design/proxy-pattern`
- [ ] Four proxy kinds; ORM lazy loading via proxies; Vue reactivity built on JS `Proxy`

**Repository** — `design/repository-pattern`
- [ ] Attributed to Fowler's *PoEAA* and DDD
- [ ] Your stance on the "repository over EF Core?" debate and generic repositories

**Rules** — `design/rules-pattern`
- [ ] ⚠ **Is this the "Rules pattern" you meant?** Your stub had only the title; I interpreted it as the rules-engine pattern (rule classes + engine)
- [ ] Example rules engines named (NRules, Microsoft RulesEngine, Drools)

**Template Method** — `design/template-method-pattern`
- [ ] Hollywood Principle; Template Method vs Strategy

**Model–View–Controller** — `design/model-view-controller`
- [ ] Origin: Smalltalk, late 1970s (your note called it a web pattern)
- [ ] MVC / MVP / MVVM / component comparison table

**Domain-Driven Design** — `design/domain-driven-design`
- [ ] Evans, 2003; strategic vs tactical split
- [ ] Aggregate rules of thumb (small, reference by ID, one per transaction)

### Frontend

**WebAssembly** — `frontend/webassembly`
- [ ] Shipped in all major browsers 2017; W3C recommendation 2019
- [ ] Real-world examples (Figma, Photoshop/AutoCAD web, ffmpeg.wasm, SQLite)
- [ ] WasmGC (Kotlin, Dart), WASI and Component Model descriptions

### Backend & APIs

**Webhooks** — `backend/webhooks`
- [ ] Signature verification over the raw body; timestamp replay window
- [ ] Standard Webhooks link and header names

**API Gateway** — `backend/api-gateway`
- [ ] Renamed from your "Gateway API" (which is a separate Kubernetes spec); you agree with the rename
- [ ] BFF section; product list

**API Styles Compared** — `backend/api-styles-compared`
- [ ] Comparison table cells (transport, caching, streaming, browser support)
- [ ] SSE vs WebSockets guidance

**GraphQL** — `backend/graphql`
- [ ] Facebook 2012, open-sourced 2015, GraphQL Foundation
- [ ] DataLoader, persisted queries, depth/complexity limits
- [ ] Errors often returned with HTTP 200

**gRPC** — `backend/grpc`
- [ ] Four call types; never reuse field numbers (`reserved`)
- [ ] Browser options (gRPC-Web, Connect, JSON transcoding); L7 load balancing

**SOAP** — `backend/soap`
- [ ] Acronym dropped in SOAP 1.2; `SOAPAction` header in 1.1
- [ ] .NET: `dotnet-svcutil` for clients, **CoreWCF** for hosting

**Event-Driven Architecture** — `backend/event-driven-architecture`
- [ ] Events vs commands table; outbox pattern steps; saga definition
- [ ] Broker vs stream examples (RabbitMQ / Service Bus vs Kafka / Event Hubs)

### Databases

**Choosing a Database** — `databases/choosing-a-database`
- [ ] Database-type examples are current
- [ ] CAP theorem summary; vector-search support claims for PostgreSQL, SQL Server, MongoDB, Redis

**Relational Databases & SQL** — `databases/relational-databases`
- [ ] ⚠ Isolation table: PostgreSQL's repeatable read also prevents phantoms; default levels (read committed for PostgreSQL / SQL Server / Oracle, repeatable read for MySQL InnoDB)
- [ ] 3NF mnemonic; join table

### Testing & Quality

**Automated Testing** — `testing/automated-testing`
- [ ] Pyramid vs trophy framing; mutation testing tools (Stryker, PIT)

**Writing Test Cases** — `testing/writing-test-cases`
- [ ] Boundary values (17/18/19, 64/65/66); decision table rows

**Test-Driven Development** — `testing/test-driven-development`
- [ ] Moved from your Development Lifecycle section to Testing; you agree
- [ ] Kent Beck attribution; outside-in vs inside-out; BDD tooling (Reqnroll/SpecFlow, Cucumber)

### DevOps & Tooling

**Conventional Commits** — `devops/conventional-commits`
- [ ] Only `feat` and `fix` defined by the spec; other types from the Angular convention
- [ ] Spec version link (v1.0.0)

**Subversion (SVN)** — `devops/svn`
- [ ] Created in 2000; global revision numbers; trunk/branches/tags convention
- [ ] Migration tools (`git svn`, SubGit, svn2git)

### Process & Delivery

**Agile, Scrum & Kanban** — `process/agile`
- [ ] ⚠ Scrum terms match the **2020 Scrum Guide** (accountabilities: Product Owner, Scrum Master, Developers; Product Goal; Definition of Done) — check [scrumguides.org](https://scrumguides.org/)
- [ ] Manifesto's four values listed correctly

**Waterfall & the V-Model** — `process/waterfall`
- [ ] Royce 1970 framing (he warned against the purely sequential model)
- [ ] V-model pairings

### Career & Interviews

**Talking About Your Experience** — `career/talking-about-your-experience`
- [ ] Your intro text kept
- [ ] **Write your own answers** to the personal questions (idea of success, etc.); there are deliberately no model answers
- [ ] Draft your 5–6 STAR stories using the template

**Questions for the Interviewer** — `career/questions-for-the-interviewer`
- [ ] Your text kept nearly verbatim; check the filled-in "why ask" notes for culture, dress code and remote working

**Algorithm Questions** — `career/algorithm-questions`
- [ ] Pattern cheat-sheet signals
- ✅ Code samples were executed and pass tests
