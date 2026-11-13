---
title: React
summary: Meta's component library for building UIs as a function of state — JSX, props, hooks, rendering and reconciliation, and the ecosystem around it.
difficulty: intermediate
tags: [react, javascript, typescript, frontend, hooks]
order: 5
related: [frontend/choosing-a-frontend-framework, frontend/angular, frontend/browser-rendering-pipeline]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 React stub (no content). Ecosystem claims (Create React App deprecated, frameworks recommended, React Compiler) reflect recent guidance; check them against react.dev.
---

**React** is a JavaScript library for building user interfaces, created at Meta and open-sourced in 2013. Its core idea: **UI is a function of state**. You describe what the screen should look like for the current state, and React works out how to update the DOM to match.

React is deliberately small, so it's a *library* rather than a framework. Routing, data fetching and state management come from the ecosystem or from a framework built on React, such as Next.js or React Router.

## Components and JSX

Components are functions that return **JSX**, an HTML-like syntax that compiles to JavaScript:

```tsx
type Props = { product: Product; onAdd: (p: Product) => void };

export function ProductCard({ product, onAdd }: Props) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      {product.inStock
        ? <button onClick={() => onAdd(product)}>Add to basket</button>
        : <span>Out of stock</span>}
    </div>
  );
}
```

- **Props** flow down from parent to child and are read-only.
- **Events** flow up through callback props such as `onAdd`.
- **Lists** need a stable `key` on each item: `{items.map(i => <Row key={i.id} item={i} />)}`.

## State and hooks

**Hooks** let function components hold state and side effects:

```tsx
function Basket() {
  const [items, setItems] = useState<Product[]>([]);
  const total = items.reduce((sum, p) => sum + p.price, 0);   // derived — just compute it

  useEffect(() => {
    document.title = `Basket (${items.length})`;              // sync with something outside React
  }, [items.length]);

  return <p>{items.length} items, £{total}</p>;
}
```

| Hook | Purpose |
| --- | --- |
| `useState` / `useReducer` | Local state |
| `useEffect` | Synchronise with external systems (subscriptions, DOM APIs) |
| `useContext` | Read values shared down the tree without passing props |
| `useRef` | Mutable value or DOM reference that doesn't trigger a re-render |
| `useMemo` / `useCallback` | Memoise expensive values or stable callbacks |

**Rules of hooks:** call them only at the top level of a component or custom hook, never inside conditions or loops. React relies on hooks being called in the same order on every render.

> [!WARNING]
> The most common React mistake is reaching for `useEffect` to compute derived state or respond to user events. If a value can be calculated from props or state, **calculate it during render**. Effects are for talking to things *outside* React.

## How rendering works

1. State changes (`setItems`) schedule a **re-render** of that component and, by default, its children.
2. React calls the components again to produce a new element tree (often called the *virtual DOM*).
3. **Reconciliation** diffs the new tree against the previous one and applies the minimal set of DOM changes.

Re-rendering is usually cheap. When it isn't, memoisation helps: `memo`, `useMemo`, and the **React Compiler**, which adds memoisation automatically at build time.

## The ecosystem

- **Frameworks:** Next.js and React Router (framework mode) provide routing, server-side rendering and data loading; Expo does the same for native apps. They're the recommended way to start a new app, and they can still produce a client-only SPA for static hosting. Create React App was deprecated in February 2025. If you'd rather not use a framework, react.dev points to build tools such as Vite, Parcel or Rsbuild.
- **Server Components:** components that run only on the server and send rendered output to the client, which reduces the JavaScript shipped. They're available through frameworks.
- **Data fetching:** TanStack Query, SWR or framework loaders.
- **State:** built-in state and context first; Zustand, Redux Toolkit or Jotai for shared client state.
- **React Native:** the same component model for iOS and Android apps.

## Strengths and trade-offs

| Strengths | Trade-offs |
| --- | --- |
| Small, flexible core; huge ecosystem | Many decisions to make (routing, data, state, styling) |
| Largest community and hiring pool | Ecosystem churn; best practice shifts often |
| JSX is "just JavaScript": composable and type-safe with TypeScript | Effects and re-render behaviour have subtle pitfalls |
| React Native for mobile | Needs a framework for SSR, routing and data loading |

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: What's the difference between props and state in React?
A: **Props** are inputs passed from a parent; they're read-only inside the component. **State** is data the component owns and changes over time with a setter (`useState`), which triggers a re-render.
- Data flows down through props; changes flow up through callback props.
- If a value can be computed from props or other state, it shouldn't be state at all — derive it during render.

Q: What actually happens when you call a state setter like `setCount(count + 1)`?
A: It doesn't change the value immediately — it **schedules a re-render**.
- React batches multiple updates in the same event into one render.
- During the current render `count` is a snapshot, so calling `setCount(count + 1)` twice only adds one. Use the updater form `setCount(c => c + 1)` when the new value depends on the old.
- On re-render React calls the component again, diffs the result and applies minimal DOM changes.

Q: A React page feels sluggish because components re-render too often. How would you diagnose and fix it?
A: **Measure first** with the React DevTools Profiler ("why did this render?") rather than guessing.
- Common causes: state held too high in the tree, new object/array/function props created every render, context values that change on every render, large lists.
- Fixes: move state down closer to where it's used; split contexts; memoise expensive children (`memo`, `useMemo`, `useCallback`) or let the React Compiler do it; virtualise long lists; avoid deriving state through effects.
- Re-renders are often cheap — only optimise what the profiler shows is slow.

Q: How do you decide between React context and a state-management library?
A: Start with **local state**, then lift it up, then **context** for values many components read that change rarely (theme, current user, locale).
- Context re-renders every consumer when its value changes, so frequently changing shared state can get slow.
- Reach for a store (Zustand, Redux Toolkit, Jotai) when lots of components update shared client state often or you need selectors, devtools or middleware.
- **Server data** (API responses) usually belongs in a data-fetching cache like TanStack Query or framework loaders, not a global store.

Q: When would you choose a framework like Next.js over a plain client-side React app?
A: Choose a framework when you need **routing, data loading and server rendering** handled for you — especially for SEO, fast first paint, or a public site.
- A plain client-side app (Vite) can suit internal tools or highly interactive apps behind a login where SEO doesn't matter.
- react.dev now recommends starting with a framework for most new apps; frameworks can still produce a static client-only SPA.
```

```recall
Q: What is React's core idea?
A: UI is a function of state: describe what the UI should look like for the current state and React updates the DOM to match.

Q: What are the rules of hooks?
A: Only call hooks at the top level of a function component or custom hook, never inside conditions, loops or nested functions, so they run in the same order every render.

Q: What is reconciliation?
A: React's process of diffing the newly rendered element tree against the previous one and applying the minimal DOM changes.

Q: Why do list items need a `key` prop?
A: Keys let React match items between renders, so it can preserve state and update, move or remove the right DOM elements.

Q: When should you NOT use useEffect?
A: To compute values derivable from props/state (calculate during render instead) or to handle user events (use event handlers); effects are for synchronising with external systems.
```
