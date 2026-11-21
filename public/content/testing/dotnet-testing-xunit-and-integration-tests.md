---
title: ".NET Testing: xUnit, WebApplicationFactory & Integration Tests"
summary: xUnit vs NUnit vs MSTest, structuring tests with fixtures, and spinning up a real ASP.NET Core app in-memory for integration tests with WebApplicationFactory.
difficulty: intermediate
tags: [dotnet, csharp, testing, aspnet-core, xunit]
order: 5
related: [testing/unit-testing, testing/automated-testing, backend/dependency-injection-in-dotnet, backend/aspnet-core]
status: needs-review
reviewNotes: New entry in the C#/.NET batch — the .NET-specific tooling depth beyond the language-agnostic testing/unit-testing entry. xUnit v3's current status checked fresh on 2026-11-21.
---

[Unit Testing](unit-testing.md) covers the concepts — Arrange/Act/Assert, test doubles, FIRST — with xUnit examples already. This entry covers the .NET-specific tooling: choosing a framework, and the single most useful tool for testing an ASP.NET Core API, `WebApplicationFactory`.

## xUnit vs NUnit vs MSTest

All three are mature, well-supported, and the differences mostly come down to syntax and ecosystem fit:

| | xUnit | NUnit | MSTest |
| --- | --- | --- | --- |
| Test attribute | `[Fact]` / `[Theory]` | `[Test]` / `[TestCase]` | `[TestMethod]` / `[DataRow]` |
| Setup/teardown | Constructor / `IDisposable` (no `[SetUp]`) | `[SetUp]` / `[TearDown]` | `[TestInitialize]` / `[TestCleanup]` |
| Parallel by default | Yes (across test classes) | Configurable | Configurable |
| Default in `dotnet new` templates | Yes (`dotnet new xunit`) | Available (`dotnet new nunit`) | Available (`dotnet new mstest`) |

**xUnit** is the most common default for new .NET projects and open-source libraries. **xUnit v3** is current and brings its own test runner (Microsoft Testing Platform) rather than relying solely on VSTest — `[Fact]`/`[Theory]` themselves are unchanged, so existing test code keeps working. Pick whichever your team already standardises on; switching has a real migration cost for little functional benefit.

```csharp
public class DiscountCalculatorTests : IDisposable           // constructor = setup, IDisposable.Dispose = teardown
{
    private readonly DiscountCalculator _calculator = new();
    public void Dispose() { /* teardown, if needed */ }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(5, 15)]
    public void Discount_depends_on_loyalty(int years, decimal expected) =>
        Assert.Equal(expected, _calculator.For(new Customer { YearsAsCustomer = years }, 100m));
}
```

**Shared, expensive setup** across many tests in a class uses `IClassFixture<T>`; across an entire test assembly, `ICollectionFixture<T>` with a `[Collection]` attribute — both avoid re-creating something costly (a database connection, a `WebApplicationFactory`) per test.

## Integration testing with WebApplicationFactory

`WebApplicationFactory<T>` boots your **entire ASP.NET Core app** in memory — real routing, real middleware, real DI container — and gives you an `HttpClient` that talks to it directly, with no network, no real port:

```csharp
public class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrdersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Swap the real database for an in-memory fake — everything else stays real
                services.RemoveAll<IOrderRepository>();
                services.AddSingleton<IOrderRepository, FakeOrderRepository>();
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Get_unknown_order_returns_404()
    {
        var response = await _client.GetAsync("/orders/00000000-0000-0000-0000-000000000000");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

This tests the thing a unit test can't: that routing, model binding, middleware (including [authentication/authorisation](../backend/authentication-sessions-vs-tokens.md)) and your handler all actually work together — while still swapping out the genuinely external dependency (the database) for something fast and deterministic.

> [!TIP]
> `Program` needs to be visible to the test project. If it's a top-level-statements `Program.cs` (the default template), add `public partial class Program { }` at the bottom of it so the test project can reference the type.

## Testing against a real database

For tests that need to verify actual SQL behaviour (a tricky query, a migration), swapping in a fake repository isn't enough. **Testcontainers** spins up a real, disposable SQL Server (or any) container for the test run — see [Containers & Docker](../devops/containers-and-docker.md) — giving you real database behaviour without a shared, stateful test database that different test runs can corrupt for each other.

```recall
Q: What's the main practical difference between xUnit's setup/teardown and NUnit's?
A: xUnit uses the constructor and IDisposable.Dispose (no dedicated attributes); NUnit uses [SetUp] and [TearDown] attributes.

Q: What does WebApplicationFactory give you that a plain unit test can't verify?
A: That the real ASP.NET Core pipeline — routing, model binding, middleware, DI — works together correctly, by running the actual app in memory behind a real HttpClient.

Q: Why make Program.cs's Program class partial when using `WebApplicationFactory<Program>`?
A: Top-level statements generate an internal Program class by default; the test project needs it to be at least visible (public partial class Program {}) to reference it as the generic type argument.

Q: When would you reach for Testcontainers instead of a fake repository in a test?
A: When you need to verify real database-specific behaviour (actual SQL, migrations) rather than just your application logic — a fake repository can't catch a bug in the SQL itself.
```
