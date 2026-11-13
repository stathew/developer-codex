---
title: Angular
summary: Google's batteries-included TypeScript framework — components, templates, dependency injection, signals-based reactivity, routing and the CLI.
difficulty: intermediate
tags: [angular, typescript, frontend, spa]
order: 4
related: [frontend/angular-signals, frontend/choosing-a-frontend-framework, design/dependency-injection, frontend/react]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Angular stub (no content). Version-specific claims (standalone default, built-in control flow, zoneless default, Vitest) describe recent Angular; check them against the current release notes. Release cadence verified against angular.dev on 2026-11-13 and corrected (12-month majors from v22).
---

**Angular** is a TypeScript framework for building web applications, maintained by Google. Where React is a UI library you assemble a stack around, Angular is **batteries-included**: routing, forms, HTTP, dependency injection, testing and a CLI all come in the box, with strong conventions. That makes it popular for large enterprise applications with many teams.

> [!NOTE]
> "AngularJS" (1.x, 2010) is a different, end-of-life framework. "Angular" (2 onwards, 2016) was a complete rewrite. This codex itself is built with Angular.

## Components

An Angular app is a tree of **components**: a TypeScript class plus a template and styles.

```ts
@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  template: `
    <h3>{{ product().name }}</h3>
    <p>{{ product().price | currency }}</p>
    @if (product().inStock) {
      <button (click)="add.emit(product())">Add to basket</button>
    } @else {
      <span>Out of stock</span>
    }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();   // data in
  readonly add = output<Product>();               // events out
}
```

Modern Angular components are **standalone**: they declare their own imports, so there's no need for `NgModule`s.

## Template syntax

| Syntax | Meaning |
| --- | --- |
| `{{ expr }}` | Interpolation |
| `[property]="expr"` | Property binding (data in) |
| `(event)="handler()"` | Event binding (data out) |
| `[(ngModel)]="value"` | Two-way binding |
| `@if`, `@for`, `@switch`, `@defer` | Built-in control flow and lazy loading |
| `value \| pipe` | Pipes for display formatting |

## Dependency injection

DI is central to Angular. Services are classes provided to components and other services by an **injector hierarchy**:

```ts
@Injectable({ providedIn: 'root' })        // one shared instance app-wide
export class BasketService {
  private readonly http = inject(HttpClient);
  readonly items = signal<Product[]>([]);
}
```

See [Dependency Injection](../design/dependency-injection.md) for the underlying idea.

## Reactivity and change detection

Angular's reactivity is now built on **[signals](angular-signals.md)**: `signal`, `computed`, `effect`, and `resource` for async data. Angular knows precisely which views read which signals, so it can update only what changed. New applications run **zoneless**, without the zone.js library that older versions used to detect changes.

**RxJS** observables remain part of the ecosystem (`HttpClient`, router events, complex async streams), with interop helpers such as `toSignal`.

## The rest of the box

- **Router:** lazy-loaded routes, guards, resolvers, and binding route parameters to component inputs.
- **Forms:** template-driven or reactive forms with validation.
- **HttpClient:** typed HTTP with interceptors (auth headers, error handling).
- **CLI:** `ng new`, `ng generate`, `ng build`, `ng test`, and `ng update` for automated migrations between versions.
- **SSR and hydration:** server-side rendering with `@angular/ssr`.

## Release cadence

From **v22** (June 2026), a major version ships roughly **every 12 months**, each supported for **24 months**: 12 months of active support, then 12 months of long-term support with critical and security fixes only. Before v22, majors came every six months. Check [angular.dev/reference/releases](https://angular.dev/reference/releases) for current dates. `ng update` runs code migrations automatically, which makes staying current much easier than with most frameworks.

## Strengths and trade-offs

| Strengths | Trade-offs |
| --- | --- |
| Complete, consistent toolkit with strong conventions | More concepts to learn up front |
| TypeScript and DI throughout, which suits large codebases | More opinionated; less freedom to pick libraries |
| Excellent CLI and automated upgrades | Historically larger bundles (much improved) |
| Backed by Google, used heavily inside it | Smaller hiring pool than React in many markets |

```recall
Q: How does Angular differ from React in scope?
A: Angular is a batteries-included framework (router, forms, HTTP, DI, CLI, testing built in); React is a UI library you combine with other libraries.

Q: What are standalone components?
A: Components that declare their own dependencies via `imports`, removing the need for NgModules.

Q: What does `ng update` do?
A: Upgrades Angular packages and runs automated code migrations for breaking changes between versions.

Q: What reactivity model does modern Angular use?
A: Signals (signal, computed, effect, resource), enabling fine-grained, zoneless change detection, with RxJS for complex async streams.
```
