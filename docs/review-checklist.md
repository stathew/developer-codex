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

## Tier 3 review (2026-11-21)

Claude re-read all 38 Tier 3 entries end to end and checked every fact-based claim — most against well-established, stable knowledge (GoF pattern taxonomy, DDD/Evans, MVC's Smalltalk origin, Royce's 1970 paper, the Agile Manifesto, SOAP/WSDL/gRPC/GraphQL fundamentals), and a few freshly against current sources where things could plausibly have drifted by 2026 (WasmGC's 2024 browser rollout, the Standard Webhooks site and header names, SQL Server 2025's native `VECTOR` type, and BDD tooling).

- **One correction made:** the Test-Driven Development entry listed BDD tooling as "SpecFlow/Reqnroll" — but SpecFlow was retired by Tricentis at the end of 2024, and **Reqnroll** (its open-source successor, created by SpecFlow's original author) is now the one to recommend for new work. The entry now leads with Reqnroll and notes SpecFlow's retirement.
- **No other factual errors found** across design patterns, DDD, WebAssembly, the API-style entries (REST/GraphQL/gRPC/SOAP/webhooks/gateway), databases, testing, SVN, Conventional Commits, Agile/Waterfall, or Algorithm Questions.
- **Genuinely left for you** — not fact-checkable by me: the Rules pattern's title interpretation, the Repository-over-EF-Core stance, the API Gateway rename, and the Career & Interviews entries' personal/subjective items (your own STAR stories, personal-question answers, and the "why ask" culture notes) — these ask for your judgement or your own words, not a fact check.

## Final batch review (2026-11-21)

The last piece: a lighter pass over the 34 entries across the Topic-gaps, Azure, SQL Server, C#/.NET and Angular-depth batches, ticking the items left over from authoring-time fact-checking. Checked against current sources where it mattered (Azure Functions hosting plans, Azure SQL's DTU-vs-vCore recommendation, .NET `HybridCache`), and against this repo's own files/APIs elsewhere (the CI/CD entry's workflow example against the real `deploy-pages.yml`; several `Span<T>`/EF Core/NgRx code samples for syntax correctness).

- **One correction made:** the [Azure Functions](../public/content/azure/azure-functions.md) entry's hosting-plans table named the current plans correctly, but didn't flag that Microsoft now documents the classic **Consumption** plan as legacy, recommending **Flex Consumption** for new serverless apps. Added a note pointing new apps at Flex Consumption.
- **No other factual errors found** across the remaining 33 entries.
- **Genuinely left for you** across all four batches — personal experience/preference/practice, hiring and org-specific judgement calls, or asking you to confirm something only you can judge: the Azure compute decision path, the MERGE-concurrency caution, missing-index-suggestion practice, the deadlock-retry pattern, Scrutor as your decorator package of choice, `ValidateScopes`/`ValidateOnBuild` team practice, records-vs-classes usage, the Workload Identity Federation org-practice note, the NgRx three-rung decision table, the SignalStore-as-default framing (community consensus, not an NgRx-official citation), and "Working with Coding Agents"' deliberately tool-agnostic framing.

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
- [x] `await` doesn't block the thread; async ≠ parallel — ✅ confirmed: standard, correct description of the event-loop/task model in both JS and C#
- [x] C# pitfalls: `.Result`/`.Wait()` deadlocks, `async void` — ✅ confirmed: both are well-documented, real footguns (sync-over-async deadlocks with a captured context; unobservable exceptions from `async void` outside event handlers)
- [x] JS pitfall: `forEach(async …)` doesn't wait — ✅ confirmed: `Array.prototype.forEach` ignores returned promises, a very common real bug

**Generics** — `fundamentals/generics`
- [x] Variance: covariance `out` / `? extends`, contravariance `in` / `? super`, PECS — ✅ confirmed: matches C#/Java's own terminology and Joshua Bloch's PECS mnemonic
- [x] C# reified vs Java erasure vs TypeScript compile-time only — ✅ confirmed: standard, accurate characterisation of each language's generics implementation
- [x] TypeScript `pluck<T, K extends keyof T>` example — ✅ verified: compiles under current TypeScript; correct use of `keyof` constraint

### Software Design

**DRY** — `design/dry-principle`
- [x] Pragmatic Programmer quote and attribution (Hunt & Thomas, 1999) — ✅ confirmed: the quote and attribution match *The Pragmatic Programmer* (1999)
- [x] Sandi Metz quote wording ("duplication is far cheaper than the wrong abstraction") — ✅ confirmed: matches Metz's well-known 2016 "the wrong abstraction" post

**Design Patterns Overview** — `design/design-patterns-overview`
- [x] GoF: 1994, 23 patterns, three families; authors' names — ✅ confirmed: Gamma, Helm, Johnson and Vlissides, *Design Patterns* (1994), 23 patterns in creational/structural/behavioural
- [x] Every pattern is placed in the right family — ✅ confirmed: all three family tables match the standard GoF classification (Rules is correctly marked as not GoF)

**Dependency Injection** — `design/dependency-injection`
- [x] .NET lifetimes table (transient / scoped / singleton) and the captive-dependency warning — ✅ confirmed: matches Microsoft's own lifetime definitions and the documented captive-dependency problem
- [x] "Scope validation catches captive dependencies in development" — ✅ confirmed: `ValidateScopes` (on by default in the Development environment since ASP.NET Core templates enabled it) throws when a singleton consumes a scoped service

**Factory** — `design/factory-pattern`
- [x] Simple factory "not a GoF pattern"; Factory Method vs Abstract Factory distinction — ✅ confirmed: Simple Factory isn't one of the 23 GoF patterns; the Factory Method/Abstract Factory distinction (one product vs families of products) matches the book

**Singleton** — `design/singleton-pattern`
- [x] `Lazy<T>` thread-safe implementation; your GameState example kept — ✅ confirmed: `Lazy<T>` is thread-safe by default (`LazyThreadSafetyMode.ExecutionAndPublication`), correctly used here

**Strategy** — `design/strategy-pattern`
- [x] "Also known as Policy"; functions-as-strategies tip — ✅ confirmed: "Policy" is GoF's own alternate name for Strategy; the functions-as-strategies point is accurate for languages with first-class functions

**Decorator** — `design/decorator-pattern`
- [x] Your intent text kept; examples (Java I/O, .NET Streams, `DelegatingHandler`) — ✅ confirmed: all three are genuine, standard real-world Decorator examples
- [x] Note that TS/Python `@decorator` syntax ≠ GoF Decorator — ✅ confirmed: a commonly made distinction, correctly drawn

**Adapter** — `design/adapter-pattern`
- [x] Comparison table vs Decorator / Proxy / Facade — ✅ confirmed: the four interfaces-exposed/purpose rows match the standard GoF distinctions

**Builder** — `design/builder-pattern`
- [x] Fluent builder and test-data-builder examples — ✅ confirmed: standard, correct fluent-builder shape; the test-data-builder pattern is accurately described

**Observer** — `design/observer-pattern`
- [x] Observer vs pub/sub distinction; signals as a variation — ✅ confirmed: direct-subscription vs broker-mediated is the standard distinction; signals as fine-grained auto-subscribing observers is an accurate characterisation

**Proxy** — `design/proxy-pattern`
- [x] Four proxy kinds; ORM lazy loading via proxies; Vue reactivity built on JS `Proxy` — ✅ confirmed: virtual/protection/remote/caching matches GoF; EF Core and Hibernate both do generate lazy-loading proxy subclasses; Vue 3's reactivity is indeed built on the JS `Proxy` object

**Repository** — `design/repository-pattern`
- [x] Attributed to Fowler's *PoEAA* and DDD — ✅ confirmed: Repository appears in Fowler's *Patterns of Enterprise Application Architecture* (2002) and in Evans' DDD
- [ ] Your stance on the "repository over EF Core?" debate and generic repositories — *the entry takes a clear position (avoid generic repositories, use real repositories only with DDD-style aggregates); whether you agree is your call*

**Rules** — `design/rules-pattern`
- [ ] ⚠ **Is this the "Rules pattern" you meant?** Your stub had only the title; I interpreted it as the rules-engine pattern (rule classes + engine) — *not fact-checkable; your call on whether this was the intended meaning*
- [x] Example rules engines named (NRules, Microsoft RulesEngine, Drools) — ✅ confirmed: all three are real, current .NET/Java rules-engine libraries

**Template Method** — `design/template-method-pattern`
- [x] Hollywood Principle; Template Method vs Strategy — ✅ confirmed: "don't call us, we'll call you" is the standard framing; the inheritance-vs-composition distinction from Strategy is accurate

**Model–View–Controller** — `design/model-view-controller`
- [x] Origin: Smalltalk, late 1970s (your note called it a web pattern) — ✅ confirmed: MVC originated at Xerox PARC in Smalltalk-79/80 (Trygve Reenskaug), well before the web
- [x] MVC / MVP / MVVM / component comparison table — ✅ confirmed: standard, accurate characterisation of each pattern and where it's typically used

**Domain-Driven Design** — `design/domain-driven-design`
- [x] Evans, 2003; strategic vs tactical split — ✅ confirmed: Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003); the strategic/tactical split is the book's own structure
- [x] Aggregate rules of thumb (small, reference by ID, one per transaction) — ✅ confirmed: matches the widely-cited Vernon/Evans aggregate design guidance

### Frontend

**WebAssembly** — `frontend/webassembly`
- [x] Shipped in all major browsers 2017; W3C recommendation 2019 — ✅ confirmed: Chrome/Firefox/Safari/Edge all shipped Wasm support in 2017; the W3C made it a formal Recommendation in December 2019
- [x] Real-world examples (Figma, Photoshop/AutoCAD web, ffmpeg.wasm, SQLite) — ✅ confirmed: all genuine, widely-cited production uses of Wasm
- [x] WasmGC (Kotlin, Dart), WASI and Component Model descriptions — ✅ verified fresh: WasmGC shipped in major engines in 2024 and Kotlin/Wasm and Dart both target it; WASI and the Component Model descriptions match current (Preview 2-era) framing

### Backend & APIs

**Webhooks** — `backend/webhooks`
- [x] Signature verification over the raw body; timestamp replay window — ✅ confirmed: HMAC-over-raw-body plus a timestamp tolerance window is the standard, correct defence against forged and replayed webhooks
- [x] Standard Webhooks link and header names — ✅ verified fresh: `standardwebhooks.com` is the real Standard Webhooks site, and `Webhook-Id`/`Webhook-Timestamp`/`Webhook-Signature` (with a `v1,<base64 HMAC-SHA256>` signature format) are exactly its defined headers

**API Gateway** — `backend/api-gateway`
- [ ] Renamed from your "Gateway API" (which is a separate Kubernetes spec); you agree with the rename — *the Kubernetes Gateway API is indeed a distinct, real spec, confirming the rename is warranted; whether you're happy with the new title is your call*
- [x] BFF section; product list — ✅ confirmed: Backend for Frontend is accurately described, and Azure API Management, AWS API Gateway, Google Apigee, YARP, Kong, NGINX, Envoy and Traefik are all real, current products in this space

**API Styles Compared** — `backend/api-styles-compared`
- [x] Comparison table cells (transport, caching, streaming, browser support) — ✅ confirmed: each cell matches the individual REST/GraphQL/gRPC/SOAP entries and standard characterisations
- [x] SSE vs WebSockets guidance — ✅ confirmed: one-way-vs-two-way is the correct basis for the recommendation

**GraphQL** — `backend/graphql`
- [x] Facebook 2012, open-sourced 2015, GraphQL Foundation — ✅ confirmed: Facebook developed it internally from 2012, open-sourced it in 2015, and stewardship moved to the Linux Foundation's GraphQL Foundation in 2019
- [x] DataLoader, persisted queries, depth/complexity limits — ✅ confirmed: all three are standard, current mitigations for GraphQL's N+1 and cost problems
- [x] Errors often returned with HTTP 200 — ✅ confirmed: a well-known GraphQL characteristic (partial `data` plus an `errors` array alongside a 200 status)

**gRPC** — `backend/grpc`
- [x] Four call types; never reuse field numbers (`reserved`) — ✅ confirmed: unary/server-streaming/client-streaming/bidirectional matches gRPC's own docs; field-number reuse is a well-documented Protocol Buffers footgun, `reserved` is the correct fix
- [x] Browser options (gRPC-Web, Connect, JSON transcoding); L7 load balancing — ✅ confirmed: all three browser workarounds and the L4-vs-L7 load-balancing point are accurate and current

**SOAP** — `backend/soap`
- [x] Acronym dropped in SOAP 1.2; `SOAPAction` header in 1.1 — ✅ confirmed: SOAP 1.2 (2003) dropped the "Simple Object Access Protocol" expansion; `SOAPAction` is an HTTP-binding-specific header present in 1.1
- [x] .NET: `dotnet-svcutil` for clients, **CoreWCF** for hosting — ✅ confirmed: `dotnet-svcutil` generates WCF-compatible clients on modern .NET; CoreWCF is the Microsoft-supported community port for hosting, since WCF server hosting isn't part of modern .NET

**Event-Driven Architecture** — `backend/event-driven-architecture`
- [x] Events vs commands table; outbox pattern steps; saga definition — ✅ confirmed: the table and the outbox/saga descriptions match standard, well-established EDA terminology
- [x] Broker vs stream examples (RabbitMQ / Service Bus vs Kafka / Event Hubs) — ✅ confirmed: an accurate, current split between queue-based brokers and retained, replayable event logs

### Databases

**Choosing a Database** — `databases/choosing-a-database`
- [x] Database-type examples are current — ✅ confirmed: PostgreSQL/SQL Server/MySQL/SQLite, MongoDB/Cosmos DB/Firestore, Redis/Valkey/DynamoDB, Cassandra/ScyllaDB/Bigtable, Neo4j/Neptune, TimescaleDB/InfluxDB/Prometheus, Elasticsearch/OpenSearch, pgvector/Pinecone/Qdrant/Weaviate are all real, current products in each category
- [x] CAP theorem summary; vector-search support claims for PostgreSQL, SQL Server, MongoDB, Redis — ✅ confirmed: the consistency/availability trade-off under partition is standard CAP framing; PostgreSQL (pgvector), SQL Server (native vector type, 2025), MongoDB (Atlas Vector Search) and Redis (RediSearch vector fields) all genuinely support vector indexes

**Relational Databases & SQL** — `databases/relational-databases`
- [x] ⚠ Isolation table: PostgreSQL's repeatable read also prevents phantoms; default levels (read committed for PostgreSQL / SQL Server / Oracle, repeatable read for MySQL InnoDB) — ✅ verified: PostgreSQL docs (no phantoms at RR; default Read Committed); MySQL 8.4 docs (InnoDB default REPEATABLE READ)
- [x] 3NF mnemonic; join table — ✅ confirmed: "the key, the whole key, and nothing but the key" is the standard 3NF mnemonic; the junction-table description for many-to-many is accurate

### Testing & Quality

**Automated Testing** — `testing/automated-testing`
- [x] Pyramid vs trophy framing; mutation testing tools (Stryker, PIT) — ✅ confirmed: both framings are real, current testing-strategy models (the trophy is Kent C. Dodds'); Stryker (JS/.NET) and PIT (Java) are real, current mutation-testing tools

**Writing Test Cases** — `testing/writing-test-cases`
- [x] Boundary values (17/18/19, 64/65/66); decision table rows — ✅ confirmed: correct application of boundary value analysis to an 18–65 range, and the decision table is internally consistent

**Test-Driven Development** — `testing/test-driven-development`
- [ ] Moved from your Development Lifecycle section to Testing; you agree — *organisational preference, not a fact to check*
- [x] Kent Beck attribution; outside-in vs inside-out; BDD tooling (Reqnroll/SpecFlow, Cucumber) — 🔧 Kent Beck attribution and the London-school/Detroit-school (outside-in/inside-out) distinction confirmed accurate. **Fixed:** the entry listed "SpecFlow/Reqnroll" — but SpecFlow was retired at the end of 2024 and Reqnroll is its actively maintained open-source successor, so the entry now leads with Reqnroll and notes SpecFlow's retirement

### DevOps & Tooling

**Conventional Commits** — `devops/conventional-commits`
- [x] Only `feat` and `fix` defined by the spec; other types from the Angular convention — ✅ confirmed: the Conventional Commits v1.0.0 spec itself only requires `fix`/`feat` (plus `BREAKING CHANGE`); `docs`/`refactor`/`perf`/etc. come from the widely-adopted Angular commit convention
- [x] Spec version link (v1.0.0) — ✅ confirmed: `conventionalcommits.org/en/v1.0.0/` is the current, correct spec version

**Subversion (SVN)** — `devops/svn`
- [x] Created in 2000; global revision numbers; trunk/branches/tags convention — ✅ confirmed: Subversion's initial release was 2000 (as a CVS successor); global (repository-wide) revision numbers and the trunk/branches/tags layout convention are both accurate
- [x] Migration tools (`git svn`, SubGit, svn2git) — ✅ confirmed: all three are real, current SVN-to-Git migration tools

### Process & Delivery

**Agile, Scrum & Kanban** — `process/agile`
- [x] ⚠ Scrum terms match the **2020 Scrum Guide** (accountabilities: Product Owner, Scrum Master, Developers; Product Goal; Definition of Done) — check [scrumguides.org](https://scrumguides.org/) — ✅ verified: scrumguides.org still offers the 2020 guide as the latest; terms match
- [x] Manifesto's four values listed correctly — ✅ confirmed: matches the Manifesto for Agile Software Development (2001) verbatim

**Waterfall & the V-Model** — `process/waterfall`
- [x] Royce 1970 framing (he warned against the purely sequential model) — ✅ confirmed: Winston Royce's 1970 paper *Managing the Development of Large Software Systems* is the usual origin cited for "Waterfall", and it did argue the purely sequential version was risky — a widely-noted irony, accurately described here
- [x] V-model pairings — ✅ confirmed: the requirements↔acceptance, system design↔system testing, architecture↔integration, module design↔unit testing pairings match the standard V-model diagram

### Career & Interviews

**Talking About Your Experience** — `career/talking-about-your-experience`
- [ ] Your intro text kept
- [ ] **Write your own answers** to the personal questions (idea of success, etc.); there are deliberately no model answers
- [ ] Draft your 5–6 STAR stories using the template

**Questions for the Interviewer** — `career/questions-for-the-interviewer`
- [ ] Your text kept nearly verbatim; check the filled-in "why ask" notes for culture, dress code and remote working

**Algorithm Questions** — `career/algorithm-questions`
- [x] Pattern cheat-sheet signals — ✅ confirmed: each "signal → pattern" row (hash map, two pointers, sliding window, binary search, BFS/DFS, heap, DP, backtracking) matches standard interview-prep guidance
- ✅ Code samples were executed and pass tests

---

## Topic-gaps batch (added after the checklist was first written)

11 new entries, all flagged `needs-review`. The ✅ items were checked against primary sources when the entries were written.

**OWASP Top 10** — `security/owasp-top-10`
- [x] Category names and order match OWASP Top 10:2025 — ✅ verified at top10.owasp.org/2025
- [x] Code examples (IDOR ownership check, fail-closed authorisation) — ✅ confirmed: both examples match the text describing them exactly
- [x] Password hashing recommendations (Argon2id, bcrypt, scrypt, PBKDF2) — ✅ confirmed: matches OWASP's own Password Storage Cheat Sheet

**Secrets Management** — `security/secrets-management`
- [x] Tooling examples (User Secrets, Key Vault, OIDC for CI, gitleaks) — ✅ confirmed: all real, current tools, correctly described
- [x] Leak-response steps — ✅ confirmed: revoke/rotate first, then check logs, clean history, add a guard — matches standard incident-response guidance (e.g. GitHub's own secret-scanning advice)

**Caching** — `backend/caching`
- [x] ⚠ .NET `HybridCache` described as combining in-memory and distributed caching with stampede protection — ✅ verified fresh: GA in .NET 9 (March 2025); it coalesces concurrent calls for the same key, giving stampede protection even with no distributed cache registered
- [x] HTTP caching header examples — ✅ confirmed: `Cache-Control: public/private/no-store` and `ETag`/`If-None-Match` match RFC 9111 semantics

**Observability** — `devops/observability`
- [x] OpenTelemetry .NET setup snippet; .NET Aspire dashboard mention — ✅ confirmed: `AddOpenTelemetry()`/`WithTracing`/`WithMetrics`/instrumentation calls are current OTel .NET APIs; Aspire's dashboard does show OTel data locally
- [x] RED/USE methods; SLI/SLO definitions — ✅ confirmed: standard SRE terminology, correctly defined

**CI/CD Pipelines** — `devops/ci-cd`
- [x] Workflow example (mirrors this repo's deploy workflow plus `npm test`) — ✅ verified against this repo's actual `.github/workflows/deploy-pages.yml`: checkout@v4, setup-node@v4 (node 24, npm cache), `npm ci`, `npm test`, `npm run build` all match
- [x] Deployment strategies table; expand-and-contract migrations — ✅ confirmed: standard, accurate descriptions

**System Design Fundamentals** — `design/system-design-fundamentals`
- [x] Latency figures (memory ~100 ns, SSD ~100 µs, datacentre round trip ~0.5 ms, cross-continent ~100+ ms) — ✅ confirmed: matches the well-known "latency numbers every programmer should know" reference figures
- [ ] Interview approach steps match how you'd want to answer

**Web Accessibility** — `frontend/web-accessibility`
- [x] WCAG 2.2 is the current Recommendation; WCAG 3 still a draft — ✅ verified (W3C)
- [x] European Accessibility Act applies from 28 June 2025 — ✅ verified (multiple legal sources)
- [x] Contrast ratios (4.5:1 / 3:1) and the "first rule of ARIA" — ✅ confirmed: matches WCAG SC 1.4.3/1.4.11 and the W3C "Using ARIA" first-rule wording
- [x] "One in six people" disability figure (WHO estimate) — ✅ confirmed: matches WHO's ~16%/1.3 billion global disability estimate

**The TypeScript Type System** — `fundamentals/typescript-type-system`
- [x] ⚠ `satisfies` + `as const` example compiles on your TypeScript version (5.0+) — ✅ confirmed: `satisfies` actually shipped in TS 4.9 (Nov 2022), so 5.0+ compiles it with room to spare; the example's syntax is valid
- [x] Discriminated union exhaustiveness example — ✅ confirmed: the `never`-assignment-in-`default` pattern is the standard exhaustiveness check

**Retrieval-Augmented Generation** — `ai-era/retrieval-augmented-generation`
- [x] Pipeline description, RAG vs fine-tuning table, failure modes — ✅ confirmed: standard, accurate RAG framing throughout

**Evaluating AI Features** — `ai-era/evaluating-ai-features`
- [x] Check types table; your view on LLM-as-judge — ✅ confirmed: the check-type taxonomy is standard, and the LLM-as-judge framing (prefer code-based checks, validate the judge against human ratings) reflects mainstream practice rather than a contestable personal take

**Working with Coding Agents** — `ai-era/working-with-coding-agents`
- [ ] Deliberately tool-agnostic; add specifics for the tools you use

---

## Azure batch

8 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21).

**Choosing Azure Compute** — `azure/choosing-azure-compute`
- [ ] Decision path and the 5-way comparison table reflect how you'd actually choose
- [x] Container Apps described as KEDA-driven with built-in Dapr — ✅ confirmed: matches Microsoft's own description of Container Apps' autoscaling (KEDA-based) and built-in Dapr integration; true regardless of your own hands-on experience with it

**Azure App Service** — `azure/azure-app-service`
- [x] Plan tiers table (Free/Shared/Basic/Standard/Premium/Isolated) — ✅ confirmed: matches current App Service plan tier names
- [x] Managed Identity example using `DefaultAzureCredential` — ✅ confirmed, standard pattern
- [x] Deployment slot swap / warm-up behaviour matches current portal/CLI behaviour — ✅ confirmed: slot swap with warm-up and slot-specific sticky settings match current documented behaviour

**Azure Functions** — `azure/azure-functions`
- [x] ⚠ **In-process .NET model lost support 10 November 2026** — ✅ verified fresh against Microsoft Learn; this entry was written 11 days after that date and treats isolated worker as the only supported option
- [x] 🔧 Hosting plans table (Consumption/Flex Consumption/Premium/Dedicated) — Flex Consumption is newer; check it matches current naming — verified fresh: the plan names are current, but Microsoft Learn now documents the classic Consumption plan as **legacy**, recommending Flex Consumption (GA) for new serverless apps. **Fixed:** added a note to the entry pointing new apps at Flex Consumption
- [x] Durable Functions description (brief, one paragraph) — ✅ confirmed: fan-out/fan-in, long-running orchestrations and checkpointing match Durable Functions' documented capabilities

**Azure SQL Database** — `azure/azure-sql-database`
- [x] Deployment options table (single DB / Managed Instance / VM) — ✅ confirmed: matches Microsoft's documented deployment options
- [x] DTU vs vCore framing, and the claim that vCore is "the current recommendation for new deployments" — ✅ verified fresh: Microsoft's purchasing-models page explicitly labels vCore "(recommended)"
- [x] Serverless auto-pause and Hyperscale descriptions — ✅ confirmed: both match Microsoft's documented behaviour (per-second billing with auto-pause; Hyperscale decouples compute from storage)

**Messaging on Azure** — `azure/messaging-on-azure`
- [x] The Service Bus / Event Grid / Event Hubs comparison table and "choosing" framing — ✅ confirmed: matches Microsoft's own characterisation of the three services
- [x] Service Bus sessions/dead-lettering, Event Grid retry/no-replay, Event Hubs replay-by-offset — ✅ confirmed: all three behaviours are accurately, currently described

**Microsoft Entra ID & App Identity** — `azure/entra-id-and-app-identity`
- [x] ⚠ Azure AD renamed to Microsoft Entra ID in 2023, with APIs/PowerShell/MSAL keeping old names — ✅ verified fresh (Microsoft's own rename announcement and guidance)
- [x] App Registration / MSAL code examples (Angular + ASP.NET Core) — ✅ confirmed: `@azure/msal-angular` config shape and `.AddMicrosoftIdentityWebApi(...)` both match current APIs
- [x] RBAC roles vs app roles distinction — ✅ confirmed: the three-way Entra ID roles / Azure RBAC / app roles split matches Microsoft's own documented distinction

**Azure Monitor & Application Insights** — `azure/azure-monitor-and-application-insights`
- [x] KQL query examples — syntax correctness — ✅ confirmed: valid KQL, correct table names (`requests`, `dependencies`) and operators (`where`/`summarize`/`bin`/`project`)
- [x] Adaptive sampling description — ✅ confirmed: matches Microsoft's documented behaviour (preserves accurate counts while reducing volume)

**Azure DevOps Pipelines** — `azure/azure-devops-pipelines`
- [x] YAML pipeline example (stages/jobs/steps, templates, environment approvals) — ✅ confirmed: valid current syntax (`UseDotNet@2`, `PublishBuildArtifacts@1`, `AzureWebApp@1`, deployment jobs with `environment`/`strategy.runOnce`, templates with parameters)
- [ ] The "Workload Identity Federation over a stored secret" recommendation matches your org's practice

---

## SQL Server & Azure SQL batch

5 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21) — this batch had the most fact-checking of any so far, since it's squarely in your stack.

**T-SQL Essentials** — `databases/tsql-essentials`
- [x] CTE, window function, `MERGE` and `CROSS APPLY` examples — syntax correctness — ✅ confirmed: all valid, current T-SQL syntax, including the `MAXRECURSION` default (100) and `CROSS`/`OUTER APPLY` semantics
- [ ] The caution against `MERGE` under high concurrency reflects your own experience/preference
- [x] `THROW` vs `RAISERROR` claim — ✅ confirmed: bare `THROW` in a `CATCH` preserves the original error number/message/severity; `RAISERROR` doesn't reproduce it the same way — matches Microsoft's own guidance

**Reading SQL Server Execution Plans** — `databases/sql-server-execution-plans`
- [x] Operator table (Key Lookup, Hash Match, Merge Join, etc.) — descriptions match what you see in SSMS — ✅ confirmed: standard, accurate operator semantics
- [ ] "Missing index suggestions aren't gospel" guidance matches your own practice
- [x] Parameter sniffing explanation and fixes (`OPTION (RECOMPILE)`, `OPTIMIZE FOR`) — ✅ confirmed: accurate explanation and current, standard fixes

**SQL Server Locking, Blocking & Deadlocks** — `databases/sql-server-locking-and-deadlocks`
- [x] ⚠ **Azure SQL Database defaults to `READ_COMMITTED_SNAPSHOT` ON; on-prem SQL Server and SQL Server on a VM default to OFF** — ✅ verified fresh against the current T-SQL reference — flagged in the entry as one of the most-cited migration surprises
- [x] Lock types table and lock escalation threshold (~5,000 locks) — ✅ confirmed: S/X/U/Intent locks and the ~5,000-lock escalation threshold match Microsoft's documented behaviour
- [ ] The retry-on-error-1205 C# pattern matches how you'd actually handle it

**SQL Server Performance Tuning & Maintenance** — `databases/sql-server-performance-tuning`
- [x] ⚠ Fragmentation thresholds (under 5% / 5–30% reorganize / over 30% rebuild) — ✅ verified fresh against Microsoft Learn, presented as a starting point to tune, not a hard rule
- [x] ⚠ Query Store on by default for new databases since SQL Server 2022 (was off 2016–2019; Azure SQL already had it on) — ✅ verified fresh
- [x] Missing/unused index DMV queries — syntax correctness — ✅ confirmed: valid queries against `sys.dm_db_missing_index_*` and `sys.dm_db_index_usage_stats`, correct column names throughout

**SQL Server Backup, Recovery & High Availability** — `databases/sql-server-backup-and-high-availability`
- [x] Recovery models table (Simple/Full/Bulk-Logged) — ✅ confirmed: matches Microsoft's documented recovery-model behaviour exactly
- [x] AG vs FCI comparison table matches your understanding — ✅ confirmed: the storage/readable-secondary/granularity distinctions match Microsoft's own AG-vs-FCI comparison
- [x] The "what Azure SQL Database replaces" table — fair framing of the PaaS trade-off — ✅ confirmed: an accurate summary of what Azure SQL Database automates versus self-managed SQL Server

---

## C#/.NET language batch

6 new entries, all flagged `needs-review`. ✅ items were checked against current Microsoft Learn docs when the entries were written (2026-11-21).

**Modern C# Language Features** — `fundamentals/modern-csharp-language-features`
- [x] Version attributions (nullable ref types C# 8, records C# 9, primary constructors C# 12, collection expressions C# 12, list patterns C# 11) — check against your target C# version — ✅ confirmed: every version attribution is correct
- [ ] Records vs classes guidance matches your own usage

**LINQ Deep Dive** — `fundamentals/linq-deep-dive`
- [x] The multiple-enumeration example and warning — ✅ confirmed: accurately describes deferred execution and re-enumeration
- [x] `IEnumerable` vs `IQueryable` framing, and the "where you call `.ToList()` decides SQL vs in-memory" claim — this is the one most worth your sign-off, since it's a common EF Core mistake — ✅ confirmed accurate, including that EF Core 3+ throws rather than silently falling back to client evaluation for untranslatable query-level operators

**Async Streams & Advanced Task Patterns** — `fundamentals/dotnet-async-streams-and-tasks`
- [x] `IAsyncEnumerable<T>` / `await foreach` example — ✅ confirmed: valid syntax, including `[EnumeratorCancellation]` and `.WithCancellation(ct)`
- [x] `Task.WhenAll` only surfacing the first exception by default — matches your experience — ✅ confirmed accurate: it throws the first faulted task's exception; the `.Exception.Flatten()` workaround is correct
- [x] `ValueTask<T>` restrictions (don't await twice) — accurately stated — ✅ confirmed: matches Microsoft's own `ValueTask` usage guidance

**.NET Memory, Span<T> & Garbage Collection** — `fundamentals/dotnet-memory-and-gc`
- [x] Generational GC description (Gen 0/1/2, LOH) — ✅ confirmed: including the 85,000-byte LOH threshold and that it's collected with Gen 2
- [x] Server GC as the ASP.NET Core default since .NET Core 3.0 — ✅ confirmed
- [x] `Span<T>`/`ArrayPool<T>` examples — syntax correctness — ✅ confirmed: valid, current APIs throughout

**Dependency Injection in .NET** — `backend/dependency-injection-in-dotnet`
- [x] ⚠ Keyed services (`AddKeyedSingleton`, `[FromKeyedServices]`) added in .NET 8 — ✅ verified fresh
- [x] Options pattern table (`IOptions`/`IOptionsSnapshot`/`IOptionsMonitor`) — ✅ confirmed: matches Microsoft's documented behaviour for each exactly
- [ ] Scrutor mentioned as the decorator package — still your preferred tool, or do you use something else?
- [ ] `ValidateScopes`/`ValidateOnBuild` guidance matches your team's practice

**.NET Testing: xUnit, WebApplicationFactory & Integration Tests** — `testing/dotnet-testing-xunit-and-integration-tests`
- [x] ⚠ xUnit v3 is current, with its own Microsoft Testing Platform runner; `[Fact]`/`[Theory]` attributes unchanged from v2 — ✅ checked fresh, though less definitively than other items (the exact current NuGet version wasn't confirmed — see note below)
- [x] xUnit vs NUnit vs MSTest table — fair comparison, and matches which one you'd actually recommend — ✅ confirmed: attribute names, setup/teardown style and template defaults are all accurate; the entry deliberately doesn't force a single recommendation ("pick whichever your team standardises on")
- [x] `WebApplicationFactory` example and the `public partial class Program {}` tip — ✅ confirmed: valid current testing APIs and a standard, still-necessary tip for top-level-statement `Program.cs` files

---

## Angular-depth batch

4 new entries, all flagged `needs-review`. ✅ items were checked against angular.dev when the entries were written (2026-11-21).

**RxJS in Angular** — `frontend/rxjs-in-angular`
- [x] The four flattening operators table (`switchMap`/`mergeMap`/`concatMap`/`exhaustMap`) and the submit-button `exhaustMap` recommendation — ✅ confirmed: standard, correct RxJS semantics and a widely-given recommendation
- [x] ⚠ `takeUntilDestroyed()` stable since Angular v19, infers `DestroyRef` automatically in an injection context — ✅ verified fresh against angular.dev
- [x] Subject/BehaviorSubject/ReplaySubject table — ✅ confirmed: standard, correct RxJS semantics

**Angular Reactive Forms** — `frontend/angular-reactive-forms`
- [x] ⚠ **Signal Forms reached stable in Angular 22** (June 2026), after being experimental in v20/v21; Reactive Forms remains fully supported — ✅ verified fresh, though from community/press coverage rather than angular.dev's own release notes directly — worth a quick look at the official v22 announcement if you want full confidence
- [x] Typed forms by default since Angular 14 — ✅ confirmed: matches Angular's own v14 announcement
- [x] `FormGroup`/`FormControl`/`FormArray` and validator examples — ✅ confirmed: valid, current Reactive Forms API

**Testing Angular Components** — `frontend/testing-angular-components`
- [x] Examples (`TestBed`, `HttpTestingController`, `vi.useFakeTimers()`) are drawn directly from this codex's own test suite (`src/app/core/*.spec.ts`), which passes in CI — ✅ verified by it actually running, not just checked against docs
- [x] CDK harness example — syntax correctness (not drawn from this codex's own tests, since it doesn't use Angular Material) — ✅ confirmed: `TestbedHarnessEnvironment.loader(fixture)` / `loader.getHarness(...)` is current, correct CDK testing API
- [x] `fixture.componentRef.setInput(...)` as the current way to set a signal input in a test — ✅ confirmed: this is Angular's own documented approach

**Angular State Management** — `frontend/angular-state-management`
- [ ] ⚠ **"SignalStore is the default choice for new feature-level state"** — this reflects current community consensus from several 2026 blog posts, *not* a direct quote from NgRx's own documentation, which I didn't fetch directly. Worth checking ngrx.io yourself if you want to rely on this framing with full confidence
- [ ] The three-rung decision table (signals / SignalStore / classic NgRx) matches how you'd actually choose
- [x] NgRx SignalStore code example (`withState`/`withComputed`/`withMethods`/`patchState`) — syntax correctness — ✅ confirmed: matches current NgRx SignalStore API exactly
