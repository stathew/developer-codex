---
title: The TypeScript Type System
summary: Structural typing, unions and narrowing, discriminated unions, utility and mapped types, `unknown` vs `any`, and the limits of compile-time types.
difficulty: intermediate
tags: [typescript, types, javascript, frontend]
order: 5
related: [fundamentals/generics, frontend/angular, frontend/react]
status: needs-review
reviewNotes: New entry from the topic-gaps batch.
---

TypeScript adds a **static type system** to JavaScript. Types are checked at compile time and then **erased**: the output is plain JavaScript. Understanding how the type system thinks makes the difference between fighting the compiler and letting it catch your bugs.

## Structural typing

TypeScript compares types by **shape**, not by name. If it has the right properties, it fits:

```ts
interface Point { x: number; y: number }
class Pixel { constructor(public x: number, public y: number, public colour: string) {} }

const p: Point = new Pixel(1, 2, 'red');   // ✅ Pixel has x and y, so it's a Point
```

This differs from C# and Java, which use **nominal** typing (names must match).

## Unions and narrowing

A **union** is "one of these types". TypeScript **narrows** it inside checks:

```ts
function format(value: string | number | Date): string {
  if (typeof value === 'string') return value.trim();     // value: string
  if (typeof value === 'number') return value.toFixed(2); // value: number
  return value.toISOString();                              // value: Date
}
```

Narrowing works with `typeof`, `instanceof`, `in`, equality checks, truthiness and custom **type guards** (`function isUser(x: unknown): x is User`).

## Discriminated unions

Give each variant a literal `kind` field and the compiler can prove you've handled every case:

```ts
type Result =
  | { kind: 'ok'; value: Order }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

function render(r: Result): string {
  switch (r.kind) {
    case 'ok': return r.value.id;
    case 'not-found': return 'No such order';
    case 'error': return r.message;
    default: {
      const unreachable: never = r;   // compile error if a new variant isn't handled
      return unreachable;
    }
  }
}
```

This makes illegal states unrepresentable, a powerful modelling technique.

## `any`, `unknown` and `never`

- **`any`** switches type checking off. It's contagious and hides bugs; avoid it.
- **`unknown`** means "could be anything, so prove what it is before using it". Use it for untrusted input such as `JSON.parse` results and API responses.
- **`never`** is the type with no values: unreachable code, exhaustive checks, functions that always throw.

## Utility and mapped types

Derive types from other types instead of duplicating them:

```ts
interface User { id: string; name: string; email: string; role: 'admin' | 'member' }

type UserUpdate = Partial<Omit<User, 'id'>>;          // all optional, no id
type PublicUser = Pick<User, 'id' | 'name'>;
type ReadonlyUser = Readonly<User>;
type Roles = User['role'];                             // 'admin' | 'member'
type UsersById = Record<string, User>;

// Mapped type: make every property nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

Other useful tools include `keyof`, `typeof` (on values), `ReturnType<F>`, `Awaited<P>`, template literal types (`` `on${Capitalize<E>}` ``) and conditional types (`T extends string ? A : B`).

## `satisfies` and `as const`

```ts
const routes = {
  home: '/',
  review: '/review',
} as const satisfies Record<string, `/${string}`>;
// checked against the shape, but keeps literal types: routes.review is '/review'
```

## Strictness

Enable `"strict": true`. Without `strictNullChecks`, `null` and `undefined` slip into every type. Also consider `noUncheckedIndexedAccess`, which makes `array[i]` possibly `undefined`.

## The big caveat: types vanish at runtime

TypeScript can't check data arriving from outside: API responses, `localStorage`, user input. A `fetch(...).then(r => r.json() as User)` is a **promise you made to the compiler**, not a check. Validate at the boundaries with a schema library such as Zod or Valibot, and infer types from the schema.

```recall
Q: What is structural typing?
A: Types are compatible if their shapes (properties and types) match, regardless of their declared names.

Q: What's the difference between any and unknown?
A: any disables type checking entirely; unknown accepts any value but requires narrowing/validation before you can use it.

Q: What is a discriminated union?
A: A union of object types sharing a literal discriminant property (e.g. kind), letting the compiler narrow variants and check exhaustiveness.

Q: How do you make a switch over a union exhaustive?
A: Assign the value to a variable of type never in the default branch; adding an unhandled variant then causes a compile error.

Q: Why isn't `response.json() as User` type-safe?
A: Types are erased at runtime; the assertion only tells the compiler to trust you. Validate external data (e.g. with Zod).

Q: What does Partial<Omit<User, 'id'>> produce?
A: A type with all of User's properties except id, each made optional.
```
