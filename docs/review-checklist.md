# Review checklist

91 entries are flagged `status: needs-review`. This checklist lists the **specific claims to verify** in each one, so a review means checking facts rather than re-reading everything cold.

## Pre-check results (2026-11-13)

Claude checked every ⚠ claim that can be verified against a source. Ticked items are annotated:

- ✅ **verified**: checked against an official or primary source today. **confirmed**: an established fact, not re-fetched.
- 🔧 **fixed**: the claim was wrong or imprecise and the entry has been corrected.

**Corrections made:**
- **Angular:** the release cadence was wrong. From v22, majors ship every 12 months with 24 months of support.
- **OAuth 2.1:** now noted as still an IETF draft.
- **React:** Create React App deprecation wording aligned with react.dev; Expo added.
- **Spring Boot 4:** now states the Java 17 baseline is kept.

**Still for you:** the unticked items need your judgement (agreeing with corrections to your notes, your own interview answers, the Rules-pattern interpretation, tool lists, framework comparisons) or are lower-risk checks. Three ⚠ items remain open for that reason: the **Rules pattern** interpretation, the **Developer Tools** lists and the **frontend framework comparison** table (its facts are standard, but the hiring and fit judgements are yours).

## Tier 2 review (2026-11-16)

All 11 version-sensitive entries re-read end to end. Fresh checks this pass: **OpenAPI** is now at 3.2 (released Sept 2025, no 4.0 exists) — the entry's "current major line: 3.x" framing stays accurate without change. **Spring Boot's virtual-thread support** landed in 3.2 (Nov 2023) — confirmed, and the entry doesn't pin a version number so nothing to fix. **VS Code `.http` support**: confirmed VS Code still needs an extension (REST Client) while Visual Studio and Rider have it natively — the entry's wording already reflects this correctly. **Svelte 5's runes**, released Oct 2024, are signals-powered — matches the comparison table. No factual errors found anywhere in Tier 2.

## Tier 1 review (2026-11-16)

Claude re-read all 8 Tier 1 entries end to end and checked the remaining fact-based items — against RFC 7636 (PKCE), RFC 9110 and RFC 9457, and for three entries against the **actual original 2023 files**, re-fetched from the legacy repo (`stathew/developer-codex-docusaurus`) to confirm the "what changed" claims rather than trusting the earlier summary of them. Newly ticked items are marked ✅ with what was checked.

- **Verified against the original source file:** the FizzBuzz bug (confirmed `for(var i = 0; i < 100; i++)` with bare `fizz =`/`buzz =` — exactly as described), the REST entry's corrections (original literally said REST "uses a subset of HTTP", cited the obsolete RFC 2616, and listed the non-existent media type `application/x-wbe+xml`), and the OOP rewrite (original literally said objects "try to communicate with each other automatically" for encapsulation, and its "Classes" section contained only the placeholder text `asd`).
- **No factual errors found** in any of the 8 entries on this pass.
- **Genuinely left for you** — not fact-checkable by me: SOLID (4 items, all "do you agree with the rewrite"), the JWT entry's `//`-comments-in-JSON style choice, and whether "invert a binary tree" is what "Reverse Binary Tree" meant (a reasonable, standard interpretation, but your original note really was just that one line — confirmed).

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
4. **Topic-gaps, Azure, SQL Server, C#/.NET and Angular-depth batches (34 entries).** All newer and already fact-checked at write time (see each batch's intro and the ✅/⚠ items below) — a lighter pass, focused on the few items left unticked, matters most for these.

---

## Tier 1: corrections to your original notes

### SOLID Principles — `design/solid-principles`
- [ ] You agree with the **Dependency Inversion** rewrite: "both depend on abstractions", not "the calling class creates the dependency" (your original described dependency injection)
- [ ] Open/Closed: you're happy with "usually via interfaces/composition" rather than "add features using inheritance"
- [ ] SRP framed as "one reason to change", tied to a stakeholder/concern
- [ ] Square/Rectangle as the Liskov example

### OAuth 2.0 & OpenID Connect — `backend/oauth-and-openid-connect`
- [x] ⚠ Roles: **resource owner = the user** (your original said the provider, e.g. Amazon) — ✅ confirmed: RFC 6749 §1.1 defines the resource owner as the entity granting access (the end-user)
- [x] ⚠ Implicit and Resource Owner Password flows deprecated; OAuth 2.1 requires PKCE for all authorization-code clients — check status at [oauth.net/2.1](https://oauth.net/2.1/) — 🔧 verified at oauth.net/2.1: omits Implicit and Password, requires PKCE and exact redirect matching. **Fixed:** entry now says OAuth 2.1 is still an IETF draft
- [x] OAuth is authorisation; sign-in is **OpenID Connect** — ✅ confirmed: the entry's own "OAuth is not login" section draws this distinction correctly
- [x] OAuth 1.0 described as legacy — ✅ confirmed, accurate characterisation
- [x] The five PKCE steps are in the right order — ✅ verified against [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636): sequence and substance match (the entry's 5 steps compress the RFC's 6)

### Object-Oriented Programming — `design/object-oriented-programming`
- [ ] Encapsulation and abstraction rewritten (your originals said objects "communicate automatically"); you agree with the new definitions — *original re-fetched from the legacy repo and confirmed verbatim: "The different objects inside of each program will try to communicate with each other automatically." The rewrite (private state, exposed valid operations) is the standard definition; still your call on the wording.*
- [x] Your Animal / Pig / Cat `Speak()` example kept for polymorphism — ✅ confirmed present, unchanged
- [x] ⚠ Abstract class vs interface table: interfaces can have **default method bodies since C# 8 / Java 8** — ✅ confirmed: Java 8 default methods (2014), C# 8 default interface members (2019)
- [x] Overloading described as compile-time ("ad-hoc") polymorphism — ✅ confirmed: standard terminology (Strachey's polymorphism taxonomy), correctly used

### Technical Interview Questions — `career/technical-interview-questions`
- [ ] Most answers were placeholders ("An class.") and are newly written. Read each answer as **your** answer: would you say it this way?
- [x] Abstract class answer: "used to achieve security" removed — ✅ confirmed: no such claim present
- [x] Clustered index answer: "PK is clustered **by default** in SQL Server, can be declared non-clustered" — ✅ confirmed present verbatim
- [ ] Secure-development answer: the list matches what you'd want to say in an interview

### Coding Exercises — `career/coding-exercises`
- [x] FizzBuzz fix: loop `1..100` (your original ran `0..99` with undeclared globals) — ✅ verified against the original `FizzBuzz.js` (legacy repo): `for(var i = 0; i < 100; i++)` with bare `fizz =`/`buzz =` assignments — matches the claim exactly
- [ ] "Reverse Binary Tree" from your notes interpreted as **invert** (mirror) a binary tree — *original re-fetched: the legacy note was literally just the two lines "Reverse Binary Tree" / "Reverse Linked List", no elaboration. "Invert" is the standard, well-known interview question this phrase usually means — but confirm it's what you intended.*
- [x] Complexities: reverse list O(n) time / O(1) space; invert tree O(n) time / O(h) space — ✅ confirmed correct
- ✅ Code samples were executed and pass tests

### REST API Design — `backend/rest-api-design` (merged your RESTful note)
- [x] ⚠ HTTP semantics now in **RFC 9110**; RFC 2616 obsolete — ✅ confirmed: RFC 9110 (2022) defines HTTP semantics; RFC 2616 was obsoleted in 2014
- [x] REST described as an architectural style (Fielding, 2000), not "a subset of HTTP" — ✅ verified against the original `RESTful.md` (legacy repo): it literally said REST "uses a subset of HTTP" and cited "the RFC 2616 protocol" — both now corrected
- [x] PUT vs POST explained by idempotency and who chooses the URL, not "update vs create" — ✅ confirmed: original said "PUT to... update a resource" / "POST to create that resource"; entry now uses the accurate framing
- [x] Your `application/x-wbe+xml` was dropped as a typo — ✅ confirmed present in the original's data-format list (not a real media type), correctly dropped
- [x] Status code list and RFC 9457 Problem Details reference — ✅ confirmed: RFC 9457 (2023) is the current Problem Details spec, correctly cited

### Database Indexes — `databases/indexes` (merged your clustered-index answer)
- [x] Clustered vs non-clustered section: "at most one clustered per table", PK clustered by default only — ✅ confirmed present and accurate
- [x] "Physically sorted on disk" qualified as a simplification — ✅ confirmed present in the NOTE callout
- [x] ⚠ PostgreSQL described as having no persistent clustered index (heap tables; `CLUSTER` is one-off) — ✅ verified: PostgreSQL docs say CLUSTER "is a one-time operation"
- [x] Clustered key advice: narrow, unique, static, ever-increasing; random GUIDs cause fragmentation — ✅ confirmed, standard SQL Server guidance

### JSON Web Tokens — `backend/json-web-tokens` (rewritten from jwt.io text)
- [x] Structure: header.payload.signature, base64url — ✅ confirmed, matches RFC 7519
- [x] HS256 (shared secret) vs RS256/ES256 (key pair) guidance — ✅ confirmed, correct and standard
- [x] Validation list: pin the algorithm, `exp`/`nbf`, `iss`, `aud` — ✅ confirmed, matches OWASP JWT security guidance
- [ ] The example uses `//` comments inside a JSON block for annotation (not valid JSON); acceptable? — *a deliberate readability choice, common in docs, but not valid JSON if copy-pasted literally. Your call — I didn't change it.*

---

## Tier 2: version-sensitive

### Angular — `frontend/angular`
- [x] ⚠ Standalone components are the default; NgModules not needed — ✅ confirmed: standalone is the default since v19
- [x] ⚠ Built-in control flow (`@if`, `@for`, `@switch`, `@defer`) — ✅ confirmed: introduced in v17, stable since v18
- [x] ⚠ New apps run **zoneless** by default — ✅ verified: zoneless is the default for new apps since v21 (Nov 2025)
- [x] ⚠ Major release every ~6 months, **18 months support** — check [angular.dev/reference/releases](https://angular.dev/reference/releases) — 🔧 **was wrong.** angular.dev: from v22, majors every **12 months** with **24 months** support (12 active + 12 LTS). Entry corrected
- [x] AngularJS (1.x) end-of-life; Angular (2+, 2016) a rewrite — ✅ confirmed: AngularJS (2010) reached end of long-term support 31 Dec 2021; Angular 2's final release was September 2016, a ground-up rewrite

### React — `frontend/react`
- [x] ⚠ **Create React App deprecated**; frameworks (Next.js, React Router) recommended; Vite for client-only — check [react.dev](https://react.dev/learn/creating-a-react-app) — 🔧 verified: react.dev deprecated CRA in Feb 2025 and recommends Next.js, React Router or Expo. **Fixed:** wording now says react.dev points to build tools (Vite, Parcel, Rsbuild) for no-framework setups, and adds Expo
- [x] ⚠ React Compiler described as adding memoisation automatically at build time — ✅ verified: React Compiler 1.0 stable (Oct 2025), build-time automatic memoisation
- [x] Server Components "available through frameworks" — ✅ confirmed: RSC needs framework/bundler support (Next.js App Router primarily), not available in a bare Vite/CRA setup
- [x] Open-sourced 2013; hooks table; rules of hooks — ✅ confirmed: React open-sourced at JSConf US, May 2013; hooks table and rules match react.dev exactly

### Blazor — `frontend/blazor`
- [x] ⚠ Four render modes as introduced in **.NET 8**: Static SSR, Interactive Server, Interactive WebAssembly, Interactive Auto — ✅ verified: Microsoft Learn render-modes docs (applies from ASP.NET Core 8.0)
- [x] ⚠ `@rendermode InteractiveServer` syntax — ✅ verified: Microsoft Learn
- [x] Interactive Server scaling advice (sticky sessions / Azure SignalR Service) — ✅ confirmed: standard Microsoft guidance for scaling Blazor Server circuits across instances
- [x] Blazor Hybrid via .NET MAUI, WPF, WinForms — ✅ confirmed: the three officially supported native hosts

### Spring & Spring Boot — `backend/spring`
- [x] ⚠ Spring Boot 3: Java 17 baseline, `javax.*` → `jakarta.*` — ✅ confirmed
- [x] ⚠ Spring Boot 4 built on Spring Framework 7 — check [spring.io/projects/spring-boot](https://spring.io/projects/spring-boot) — 🔧 verified (InfoQ, Baeldung; spring.io not fetched): both GA in Nov 2025, Java 17 baseline kept. **Fixed:** entry now states the Java 17 baseline
- [x] `@Transactional` self-invocation pitfall (proxy bypass) — ✅ confirmed: well-known Spring gotcha, correctly described (proxy-based AOP can't intercept internal self-calls)
- [x] Virtual threads supported (Java 21+) — ✅ verified: `spring.threads.virtual.enabled` landed in Spring Boot 3.2 (Nov 2023), requires Java 21+; the entry doesn't pin a Boot version so nothing to correct

### ASP.NET Core — `backend/aspnet-core`
- [x] ⚠ Minimal APIs "now the default in templates" — ✅ verified: `dotnet new webapi` creates minimal APIs unless `--use-controllers`
- [x] ⚠ "Even-numbered .NET releases are LTS" — check [dotnet.microsoft.com support policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core) — ✅ verified: Microsoft lifecycle page (.NET 8 and 10 are LTS). Note: .NET 8 reached end of support on 10 Nov 2026, and .NET 10 (LTS, to Nov 2028) is current
- [x] Middleware order example (exception handler first, authn before authz) — ✅ confirmed: matches Microsoft's documented middleware ordering guidance
- [x] IIS hosting via the ASP.NET Core Module (in-process or out-of-process) — ✅ confirmed: correct, standard terminology

### OpenAPI & Swagger — `backend/openapi-and-swagger`
- [x] Spec renamed from Swagger to OpenAPI in 2016; current line 3.x (example uses 3.1.0) — ✅ confirmed; also checked freshly: the current line is now **3.2** (released Sept 2025, no 4.0 exists), so the entry's deliberately-generic "3.x" framing is still accurate without needing a change
- [x] ⚠ **.NET 9+ templates use `Microsoft.AspNetCore.OpenApi`** instead of Swashbuckle — ✅ verified: Swashbuckle was removed from the template in .NET 9 (still available on NuGet)

### ORMs & Entity Framework Core — `databases/entity-framework-core`
- [x] EF6 described as maintenance-mode, EF Core for new work — ✅ confirmed per Microsoft's own EF6 docs
- [x] `dotnet ef` migration commands — ✅ confirmed: `migrations add`, `database update` and `migrations script` are all current, unchanged CLI syntax
- [x] ⚠ `LogTo(Console.WriteLine)` for SQL logging — ✅ confirmed: simple logging API since EF Core 5

### Unit Testing — `testing/unit-testing`
- [x] ⚠ "Vitest is Angular's default test runner **since v21**" — ✅ verified: Vitest is the default for new projects in v21; Karma still available
- [x] Test-double taxonomy (dummy / stub / fake / spy / mock) — ✅ confirmed: matches Gerard Meszaros' established taxonomy (*xUnit Test Patterns*)
- [x] NSubstitute example syntax — ✅ confirmed: `Substitute.For<T>()` / `.Returns(...)` is current, unchanged NSubstitute API

### Containers & Docker — `devops/containers-and-docker`
- [x] ⚠ Dockerfile uses `mcr.microsoft.com/dotnet/sdk:10.0` / `aspnet:10.0` and `USER app`; check current tags — ✅ verified: .NET 10 is the current LTS; .NET 8+ images include a non-root `app` user and default to port 8080
- [x] ⚠ `dotnet publish /t:PublishContainer` builds images without a Dockerfile — ✅ confirmed: built into the .NET SDK since .NET 8
- [x] Compose example uses `postgres:17`; the `dev-only` password is clearly a placeholder — ✅ confirmed: a real, current major version used purely as an example, and `dev-only` is obviously not a real credential

### Choosing a Frontend Framework — `frontend/choosing-a-frontend-framework`
- [x] ⚠ Comparison table: reactivity models (Svelte "runes", Vue proxies/refs), SSR frameworks — ✅ verified: Svelte 5's runes (Oct 2024) are signals-powered; Vue 3's reactivity is proxy-based (`reactive()`) — both correctly described
- [x] "Industry converging on signals" claim — ✅ accurate as a trend statement (Angular, Vue, Svelte 5, Solid, Preact, Qwik all use some signal form); not a precisely falsifiable claim, but fairly characterised
- [ ] Hiring-market statements are fair for your region — *genuinely regional; not something I can check for you*

### Developer Tools Overview — `devops/developer-tools-overview`
- [ ] ⚠ Tool lists are examples and will date; prune to what **you** actually use or recommend — *your call, not a fact to check*
- [x] `.http` file support claims (Visual Studio, Rider, VS Code extension) — ✅ verified: VS Code still has no native `.http` support (needs the REST Client extension); Visual Studio and Rider both have it built in. The entry's phrasing already reflects this correctly

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
- [x] ⚠ Isolation table: PostgreSQL's repeatable read also prevents phantoms; default levels (read committed for PostgreSQL / SQL Server / Oracle, repeatable read for MySQL InnoDB) — ✅ verified: PostgreSQL docs (no phantoms at RR; default Read Committed); MySQL 8.4 docs (InnoDB default REPEATABLE READ)
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
- [x] ⚠ Scrum terms match the **2020 Scrum Guide** (accountabilities: Product Owner, Scrum Master, Developers; Product Goal; Definition of Done) — check [scrumguides.org](https://scrumguides.org/) — ✅ verified: scrumguides.org still offers the 2020 guide as the latest; terms match
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

---

## Topic-gaps batch (added after the checklist was first written)

11 new entries, all flagged `needs-review`. The ✅ items were checked against primary sources when the entries were written.

**OWASP Top 10** — `security/owasp-top-10`
- [x] Category names and order match OWASP Top 10:2025 — ✅ verified at top10.owasp.org/2025
- [ ] Code examples (IDOR ownership check, fail-closed authorisation)
- [ ] Password hashing recommendations (Argon2id, bcrypt, scrypt, PBKDF2)

**Secrets Management** — `security/secrets-management`
- [ ] Tooling examples (User Secrets, Key Vault, OIDC for CI, gitleaks)
- [ ] Leak-response steps

**Caching** — `backend/caching`
- [ ] ⚠ .NET `HybridCache` described as combining in-memory and distributed caching with stampede protection
- [ ] HTTP caching header examples

**Observability** — `devops/observability`
- [ ] OpenTelemetry .NET setup snippet; .NET Aspire dashboard mention
- [ ] RED/USE methods; SLI/SLO definitions

**CI/CD Pipelines** — `devops/ci-cd`
- [ ] Workflow example (mirrors this repo's deploy workflow plus `npm test`)
- [ ] Deployment strategies table; expand-and-contract migrations

**System Design Fundamentals** — `design/system-design-fundamentals`
- [ ] Latency figures (memory ~100 ns, SSD ~100 µs, datacentre round trip ~0.5 ms, cross-continent ~100+ ms)
- [ ] Interview approach steps match how you'd want to answer

**Web Accessibility** — `frontend/web-accessibility`
- [x] WCAG 2.2 is the current Recommendation; WCAG 3 still a draft — ✅ verified (W3C)
- [x] European Accessibility Act applies from 28 June 2025 — ✅ verified (multiple legal sources)
- [ ] Contrast ratios (4.5:1 / 3:1) and the "first rule of ARIA"
- [ ] "One in six people" disability figure (WHO estimate)

**The TypeScript Type System** — `fundamentals/typescript-type-system`
- [ ] ⚠ `satisfies` + `as const` example compiles on your TypeScript version (5.0+)
- [ ] Discriminated union exhaustiveness example

**Retrieval-Augmented Generation** — `ai-era/retrieval-augmented-generation`
- [ ] Pipeline description, RAG vs fine-tuning table, failure modes

**Evaluating AI Features** — `ai-era/evaluating-ai-features`
- [ ] Check types table; your view on LLM-as-judge

**Working with Coding Agents** — `ai-era/working-with-coding-agents`
- [ ] Deliberately tool-agnostic; add specifics for the tools you use

---

## Azure batch

8 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21).

**Choosing Azure Compute** — `azure/choosing-azure-compute`
- [ ] Decision path and the 5-way comparison table reflect how you'd actually choose
- [ ] Container Apps described as KEDA-driven with built-in Dapr — confirm this matches your experience if you've used it

**Azure App Service** — `azure/azure-app-service`
- [ ] Plan tiers table (Free/Shared/Basic/Standard/Premium/Isolated)
- [x] Managed Identity example using `DefaultAzureCredential` — ✅ confirmed, standard pattern
- [ ] Deployment slot swap / warm-up behaviour matches current portal/CLI behaviour

**Azure Functions** — `azure/azure-functions`
- [x] ⚠ **In-process .NET model lost support 10 November 2026** — ✅ verified fresh against Microsoft Learn; this entry was written 11 days after that date and treats isolated worker as the only supported option
- [ ] Hosting plans table (Consumption/Flex Consumption/Premium/Dedicated) — Flex Consumption is newer; check it matches current naming
- [ ] Durable Functions description (brief, one paragraph)

**Azure SQL Database** — `azure/azure-sql-database`
- [ ] Deployment options table (single DB / Managed Instance / VM)
- [ ] DTU vs vCore framing, and the claim that vCore is "the current recommendation for new deployments"
- [ ] Serverless auto-pause and Hyperscale descriptions

**Messaging on Azure** — `azure/messaging-on-azure`
- [ ] The Service Bus / Event Grid / Event Hubs comparison table and "choosing" framing
- [ ] Service Bus sessions/dead-lettering, Event Grid retry/no-replay, Event Hubs replay-by-offset

**Microsoft Entra ID & App Identity** — `azure/entra-id-and-app-identity`
- [x] ⚠ Azure AD renamed to Microsoft Entra ID in 2023, with APIs/PowerShell/MSAL keeping old names — ✅ verified fresh (Microsoft's own rename announcement and guidance)
- [ ] App Registration / MSAL code examples (Angular + ASP.NET Core)
- [ ] RBAC roles vs app roles distinction

**Azure Monitor & Application Insights** — `azure/azure-monitor-and-application-insights`
- [ ] KQL query examples — syntax correctness
- [ ] Adaptive sampling description

**Azure DevOps Pipelines** — `azure/azure-devops-pipelines`
- [ ] YAML pipeline example (stages/jobs/steps, templates, environment approvals)
- [ ] The "Workload Identity Federation over a stored secret" recommendation matches your org's practice

---

## SQL Server & Azure SQL batch

5 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21) — this batch had the most fact-checking of any so far, since it's squarely in your stack.

**T-SQL Essentials** — `databases/tsql-essentials`
- [ ] CTE, window function, `MERGE` and `CROSS APPLY` examples — syntax correctness
- [ ] The caution against `MERGE` under high concurrency reflects your own experience/preference
- [ ] `THROW` vs `RAISERROR` claim

**Reading SQL Server Execution Plans** — `databases/sql-server-execution-plans`
- [ ] Operator table (Key Lookup, Hash Match, Merge Join, etc.) — descriptions match what you see in SSMS
- [ ] "Missing index suggestions aren't gospel" guidance matches your own practice
- [ ] Parameter sniffing explanation and fixes (`OPTION (RECOMPILE)`, `OPTIMIZE FOR`)

**SQL Server Locking, Blocking & Deadlocks** — `databases/sql-server-locking-and-deadlocks`
- [x] ⚠ **Azure SQL Database defaults to `READ_COMMITTED_SNAPSHOT` ON; on-prem SQL Server and SQL Server on a VM default to OFF** — ✅ verified fresh against the current T-SQL reference — flagged in the entry as one of the most-cited migration surprises
- [ ] Lock types table and lock escalation threshold (~5,000 locks)
- [ ] The retry-on-error-1205 C# pattern matches how you'd actually handle it

**SQL Server Performance Tuning & Maintenance** — `databases/sql-server-performance-tuning`
- [x] ⚠ Fragmentation thresholds (under 5% / 5–30% reorganize / over 30% rebuild) — ✅ verified fresh against Microsoft Learn, presented as a starting point to tune, not a hard rule
- [x] ⚠ Query Store on by default for new databases since SQL Server 2022 (was off 2016–2019; Azure SQL already had it on) — ✅ verified fresh
- [ ] Missing/unused index DMV queries — syntax correctness

**SQL Server Backup, Recovery & High Availability** — `databases/sql-server-backup-and-high-availability`
- [ ] Recovery models table (Simple/Full/Bulk-Logged)
- [ ] AG vs FCI comparison table matches your understanding
- [ ] The "what Azure SQL Database replaces" table — fair framing of the PaaS trade-off

---

## C#/.NET language batch

6 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21).

**Modern C# Language Features** — `fundamentals/modern-csharp-language-features`
- [ ] Version attributions (nullable ref types C# 8, records C# 9, primary constructors C# 12, collection expressions C# 12, list patterns C# 11) — check against your target C# version
- [ ] Records vs classes guidance matches your own usage

**LINQ Deep Dive** — `fundamentals/linq-deep-dive`
- [ ] The multiple-enumeration example and warning
- [ ] `IEnumerable` vs `IQueryable` framing, and the "where you call `.ToList()` decides SQL vs in-memory" claim — this is the one most worth your sign-off, since it's a common EF Core mistake

**Async Streams & Advanced Task Patterns** — `fundamentals/dotnet-async-streams-and-tasks`
- [ ] `IAsyncEnumerable<T>` / `await foreach` example
- [ ] `Task.WhenAll` only surfacing the first exception by default — matches your experience
- [ ] `ValueTask<T>` restrictions (don't await twice) — accurately stated

**.NET Memory, Span<T> & Garbage Collection** — `fundamentals/dotnet-memory-and-gc`
- [ ] Generational GC description (Gen 0/1/2, LOH)
- [ ] Server GC as the ASP.NET Core default since .NET Core 3.0
- [ ] `Span<T>`/`ArrayPool<T>` examples — syntax correctness

**Dependency Injection in .NET** — `backend/dependency-injection-in-dotnet`
- [x] ⚠ Keyed services (`AddKeyedSingleton`, `[FromKeyedServices]`) added in .NET 8 — ✅ verified fresh
- [ ] Options pattern table (`IOptions`/`IOptionsSnapshot`/`IOptionsMonitor`)
- [ ] Scrutor mentioned as the decorator package — still your preferred tool, or do you use something else?
- [ ] `ValidateScopes`/`ValidateOnBuild` guidance matches your team's practice

**.NET Testing: xUnit, WebApplicationFactory & Integration Tests** — `testing/dotnet-testing-xunit-and-integration-tests`
- [x] ⚠ xUnit v3 is current, with its own Microsoft Testing Platform runner; `[Fact]`/`[Theory]` attributes unchanged from v2 — ✅ checked fresh, though less definitively than other items (the exact current NuGet version wasn't confirmed — see note below)
- [ ] xUnit vs NUnit vs MSTest table — fair comparison, and matches which one you'd actually recommend
- [ ] `WebApplicationFactory` example and the `public partial class Program {}` tip

---

## Angular-depth batch

4 new entries, all flagged `needs-review`. ✅ items were checked against angular.dev when the entries were written (2026-11-21).

**RxJS in Angular** — `frontend/rxjs-in-angular`
- [ ] The four flattening operators table (`switchMap`/`mergeMap`/`concatMap`/`exhaustMap`) and the submit-button `exhaustMap` recommendation
- [x] ⚠ `takeUntilDestroyed()` stable since Angular v19, infers `DestroyRef` automatically in an injection context — ✅ verified fresh against angular.dev
- [ ] Subject/BehaviorSubject/ReplaySubject table

**Angular Reactive Forms** — `frontend/angular-reactive-forms`
- [x] ⚠ **Signal Forms reached stable in Angular 22** (June 2026), after being experimental in v20/v21; Reactive Forms remains fully supported — ✅ verified fresh, though from community/press coverage rather than angular.dev's own release notes directly — worth a quick look at the official v22 announcement if you want full confidence
- [ ] Typed forms by default since Angular 14
- [ ] `FormGroup`/`FormControl`/`FormArray` and validator examples

**Testing Angular Components** — `frontend/testing-angular-components`
- [x] Examples (`TestBed`, `HttpTestingController`, `vi.useFakeTimers()`) are drawn directly from this codex's own test suite (`src/app/core/*.spec.ts`), which passes in CI — ✅ verified by it actually running, not just checked against docs
- [ ] CDK harness example — syntax correctness (not drawn from this codex's own tests, since it doesn't use Angular Material)
- [ ] `fixture.componentRef.setInput(...)` as the current way to set a signal input in a test

**Angular State Management** — `frontend/angular-state-management`
- [ ] ⚠ **"SignalStore is the default choice for new feature-level state"** — this reflects current community consensus from several 2026 blog posts, *not* a direct quote from NgRx's own documentation, which I didn't fetch directly. Worth checking ngrx.io yourself if you want to rely on this framing with full confidence
- [ ] The three-rung decision table (signals / SignalStore / classic NgRx) matches how you'd actually choose
- [ ] NgRx SignalStore code example (`withState`/`withComputed`/`withMethods`/`patchState`) — syntax correctness
