---
title: Testing Angular Components
summary: TestBed and ComponentFixture, mocking HTTP with HttpTestingController, CDK component harnesses, and testing signals vs observables — with Vitest.
difficulty: intermediate
tags: [angular, testing, vitest]
order: 11
related: [frontend/angular, frontend/rxjs-in-angular, testing/unit-testing, testing/dotnet-testing-xunit-and-integration-tests]
status: needs-review
reviewNotes: New entry in the Angular-depth batch. Examples mirror the patterns actually used in this codex's own test suite (src/app/core/*.spec.ts), run with Vitest, Angular's default test runner since v21.
---

[Unit Testing](../testing/unit-testing.md) covers the concepts; this entry is Angular's own testing tools in practice. Since Angular 21, **Vitest** is the default test runner (`ng test`) — the examples below are exactly how this codex tests its own services and components.

## TestBed and ComponentFixture

`TestBed` builds a small Angular module/injector just for the test; `ComponentFixture` wraps the created component and its rendered DOM.

```ts
describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductCard] });
    fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { name: 'Keyboard', price: 42, inStock: true });
    fixture.detectChanges();   // run change detection so the template actually renders
  });

  it('shows the add-to-basket button when in stock', () => {
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Add to basket');
  });
});
```

`fixture.componentRef.setInput(...)` is the current way to set a **signal input** (`input()`) from a test — assigning the property directly doesn't work, since it's a signal, not a plain field.

## Mocking HTTP with HttpTestingController

Never let a test hit a real network. `provideHttpClientTesting()` replaces the real `HttpClient` backend with one you control directly:

```ts
describe('SearchService', () => {
  let search: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    search = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('loads the search index', async () => {
    const loaded = search.ensureLoaded();
    const req = httpMock.expectOne('content/search-index.json?v=v1');
    req.flush({ docs: [] });              // respond with fake data — no real request ever happens
    await loaded;
    expect(search.ready()).toBe(true);
  });

  afterEach(() => httpMock.verify());     // fails the test if any request was never matched/flushed
});
```

`httpMock.verify()` in `afterEach` is worth always including — it catches requests your code made that the test never asserted on, which usually means an untested code path or an accidental extra call.

## Testing with fake timers

For anything time-based — debouncing, polling, the spaced-repetition scheduling in this codex's own `UserDataService` — control time explicitly instead of making tests slow and flaky with real delays:

```ts
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-21T10:00:00'));
});
afterEach(() => vi.useRealTimers());

it('schedules the next review a day later on a good grade', () => {
  user.grade(card, 'good');
  expect(user.cardState(card.id)?.due).toBe(dueIn(1));   // computed against the faked "now"
});
```

## Testing signals vs observables

A **signal**'s current value is read synchronously (`component.total()`), with no subscription or async handling needed in the test at all. An **observable** needs either the `async` pipe rendering it (then `fixture.detectChanges()` after the microtask queue flushes) or an explicit subscription in the test to capture emitted values — signals are usually the simpler thing to test, which is itself a point in their favour.

## Component harnesses

For components built from a UI library (Angular Material, or your own with a defined interaction contract), `@angular/cdk/testing` harnesses let tests interact through a stable, documented API instead of brittle CSS selectors that break when markup changes:

```ts
const loader = TestbedHarnessEnvironment.loader(fixture);
const button = await loader.getHarness(MatButtonHarness.with({ text: 'Add to basket' }));
await button.click();
```

```recall
Q: Why can't you set a signal input directly on a component instance in a test?
A: A signal input is a signal, not a plain property; use fixture.componentRef.setInput('name', value) instead of assigning component.name = value.

Q: What does httpMock.verify() check for in an HttpTestingController test?
A: That every HTTP request made during the test was matched and flushed — it fails the test if a request was made but never asserted on.

Q: Why use vi.useFakeTimers() instead of real delays when testing time-based logic?
A: It makes tests fast and deterministic by controlling the clock explicitly, instead of waiting on real time (which is slow and can be flaky).

Q: What advantage do CDK component harnesses have over querying CSS selectors directly in a test?
A: They interact through a stable, documented API tied to the component's behaviour, so tests don't break when internal markup/CSS changes.
```
