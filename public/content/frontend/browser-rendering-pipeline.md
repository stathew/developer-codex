---
title: The Browser Rendering Pipeline
summary: How HTML, CSS and JavaScript become pixels — parse, style, layout, paint, composite — and which code triggers which (expensive) steps.
difficulty: intermediate
tags: [browser, performance, css, javascript]
order: 1
related: [frontend/angular-signals, fundamentals/big-o-notation]
---

Every frame the browser shows is the output of a pipeline. Knowing the stages tells you why some UI code is silky and some janks — and how to tell which is which in DevTools.

## The stages

1. **Parse** — HTML becomes the **DOM**; CSS becomes the **CSSOM**.
2. **Style** — match selectors to elements and compute final styles.
3. **Layout** (reflow) — compute every box's size and position.
4. **Paint** — fill in pixels: text, colours, borders, shadows, images.
5. **Composite** — combine painted layers, often on the GPU, into the final frame.

At 60 fps the browser has about **16.7 ms** per frame for all of this *plus* your JavaScript.

## What triggers what

| You change | Layout | Paint | Composite |
| --- | --- | --- | --- |
| `width`, `height`, `top`, `font-size`, DOM structure | ✅ | ✅ | ✅ |
| `color`, `background`, `box-shadow` | — | ✅ | ✅ |
| `transform`, `opacity` | — | — | ✅ |

> [!TIP]
> Animate `transform` and `opacity` wherever possible. They can be handled by the compositor alone, often off the main thread.

## Layout thrashing

Reading a layout property (`offsetHeight`, `getBoundingClientRect()`) forces the browser to compute layout *now* if anything has changed. Interleaving reads and writes in a loop forces a layout on every iteration:

```js
// ❌ Forced synchronous layout on every iteration
for (const el of items) {
  el.style.width = box.offsetWidth + 'px'; // read → write → read → write…
}

// ✅ Batch reads, then batch writes
const width = box.offsetWidth;
for (const el of items) el.style.width = width + 'px';
```

## The main thread is shared

JavaScript, style, layout and paint mostly share **one main thread**. A 200 ms task blocks input handling for 200 ms. Strategies:

- Break up long tasks (`scheduler.yield()`, `setTimeout` chunks).
- Move heavy computation to a **Web Worker**.
- Virtualise long lists so you render only what's visible.

## Critical rendering path

On first load, CSS is **render-blocking** and synchronous `<script>` is **parser-blocking**. Use `defer`/`type="module"` for scripts, inline critical CSS for above-the-fold content, and lazy-load what isn't needed immediately.

```recall
Q: List the five stages of the rendering pipeline.
A: Parse (DOM/CSSOM), Style, Layout, Paint, Composite.

Q: Which CSS properties can usually be animated without triggering layout or paint?
A: `transform` and `opacity` — they only require compositing.

Q: What is layout thrashing?
A: Interleaving DOM writes with layout reads (like offsetHeight) so the browser is forced to recalculate layout repeatedly, often inside a loop.
```
