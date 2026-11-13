---
title: Choosing a Frontend Framework
summary: Angular, React and Blazor (plus Vue and Svelte) compared on approach, reactivity, rendering and ecosystem — and the questions that should drive the choice.
difficulty: beginner
tags: [frontend, angular, react, blazor, architecture]
order: 3
related: [frontend/angular, frontend/react, frontend/blazor, frontend/angular-signals]
status: needs-review
reviewNotes: New hub entry comparing the frontend framework entries, created alongside the frameworks backlog batch.
---

All modern frontend frameworks share the same core idea: **build the UI from components, and update it automatically when state changes**. They differ in how much they include, how they track changes, and which language you write.

## At a glance

| | [Angular](angular.md) | [React](react.md) | [Blazor](blazor.md) | Vue | Svelte |
| --- | --- | --- | --- | --- | --- |
| **Type** | Full framework | UI library | Full framework (.NET) | Progressive framework | Compiler-based framework |
| **Language** | TypeScript | JS/TS + JSX | C# + Razor | JS/TS + templates | JS/TS + templates |
| **Reactivity** | Signals | Re-render + reconcile | Re-render + diff | Proxies/refs | Compiled runes/signals |
| **Built in** | Router, forms, HTTP, DI, CLI | Rendering only | Router, forms, DI, auth | Core + official router/state | Core + SvelteKit |
| **SSR framework** | `@angular/ssr` | Next.js, React Router | Built in (static SSR) | Nuxt | SvelteKit |
| **Backed by** | Google | Meta | Microsoft | Community | Community (Vercel-supported) |
| **Learning curve** | Steeper | Moderate (ecosystem choices) | Easy for .NET devs | Gentle | Gentle |

## Two ways to track change

- **Re-render and diff** (React, Blazor): when state changes, re-run the component and compare the output with the previous result to find what changed. Simple to reason about; performance may need memoisation.
- **Fine-grained reactivity** (Angular signals, Vue, Svelte, Solid): track exactly which pieces of UI depend on which state, and update only those. Less wasted work, with dependency tracking handled for you.

The industry is converging on **signals**. Angular, Vue, Svelte, Solid and Preact all use some form of them.

## How to choose

1. **What does your team already know?** Productivity and maintainability beat small technical differences. A .NET team can be productive in Blazor on day one.
2. **How big is the app and the team?** Angular's conventions pay off in large, long-lived codebases with many developers. React's flexibility suits teams who want to choose their own stack.
3. **Do you need SEO or fast first paint?** Choose something with good server-side rendering: Next.js, Nuxt, SvelteKit, Angular SSR or Blazor static SSR.
4. **Mobile apps too?** React Native (React) or .NET MAUI with Blazor Hybrid share the most.
5. **Hiring:** React has the largest talent pool in most markets; Angular is strong in enterprise; Blazor is mostly found in .NET shops.

> [!TIP]
> The fundamentals transfer: components, one-way data flow, state management, rendering cost and accessibility. Learn those deeply and switching frameworks becomes a matter of syntax. See [The Browser Rendering Pipeline](browser-rendering-pipeline.md).

> [!AI]
> AI assistants are trained on far more React code than anything else, and on older versions of every framework. Expect suggestions that use outdated patterns (class components, NgModules, `useEffect` for derived state) and check them against current docs.

```recall
Q: What's the difference between "re-render and diff" and fine-grained reactivity?
A: Re-render and diff re-runs components and compares output to find changes (React, Blazor); fine-grained reactivity tracks which UI depends on which state and updates only that (signals in Angular, Vue, Svelte, Solid).

Q: Which frontend option suits a .NET team wanting to share C# models with the backend?
A: Blazor.

Q: Why does Angular suit large enterprise codebases?
A: It's batteries-included with strong conventions, TypeScript and DI throughout, so many teams build things consistently.
```
