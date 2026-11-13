---
title: WebAssembly
summary: A portable, sandboxed binary format that runs code from C, C++, Rust, C# and more in the browser at near-native speed — and increasingly outside it with WASI.
difficulty: intermediate
tags: [webassembly, wasm, frontend, performance, rust, blazor]
order: 7
related: [frontend/blazor, frontend/browser-rendering-pipeline, fundamentals/async-await]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Web Assembly stub (no content).
---

**WebAssembly (Wasm)** is a compact **binary instruction format** for a sandboxed virtual machine. All major browsers support it, alongside JavaScript. You don't usually write Wasm by hand: you **compile** other languages to it and run the result at near-native speed.

It shipped in all major browsers in 2017 and became a W3C standard in 2019.

## How it fits with JavaScript

Wasm doesn't replace JavaScript; it **complements** it.

- JavaScript loads and instantiates a Wasm module, then calls its exported functions.
- Wasm can call **imported** JavaScript functions.
- Wasm has **no direct DOM access**. UI work goes through JavaScript glue code, which is usually generated for you.

```js
const { instance } = await WebAssembly.instantiateStreaming(fetch('/image-tools.wasm'), {
  env: { log: (n) => console.log(n) },          // imports Wasm can call
});
const blurred = instance.exports.blur(ptr, width, height, radius);   // exported Wasm function
```

## Languages and toolchains

| Language | Tooling |
| --- | --- |
| C / C++ | Emscripten |
| Rust | `wasm-pack`, `wasm-bindgen` (excellent support) |
| C# / .NET | [Blazor WebAssembly](blazor.md), .NET WASI support |
| Go | Built-in `GOOS=js GOARCH=wasm`, TinyGo |
| Kotlin, Dart | Via **WasmGC**, which lets garbage-collected languages use the host's GC |
| AssemblyScript | A TypeScript-like language designed for Wasm |

## What it's good for

- **CPU-heavy work in the browser:** image and video processing, audio, compression, CAD, simulations, games.
- **Reusing existing native code on the web.** Figma's rendering engine, Photoshop and AutoCAD on the web, `ffmpeg.wasm` and SQLite in the browser are all compiled to Wasm.
- **Running non-JavaScript languages** in the browser (Blazor, Python via Pyodide).
- **Sandboxed plugins:** safely running untrusted extension code inside an application.

## What it's not

- **Not automatically faster for typical UI code.** Crossing the JS↔Wasm boundary has a cost, and DOM work still goes through JavaScript.
- **Not small by default.** Runtimes for managed languages add download size, a known trade-off of Blazor WebAssembly.
- **Not a security hole:** it runs in the same sandbox as JavaScript, under the same-origin and permission rules.

## Beyond the browser: WASI

The **WebAssembly System Interface (WASI)** gives Wasm modules controlled access to files, clocks, sockets and so on, so they can run on servers and edge platforms (Wasmtime, WasmEdge, Fermyon Spin, Cloudflare Workers). Attractions include tiny, fast-starting, strongly sandboxed workloads and language-neutral plugins. The **Component Model** standardises how Wasm modules written in different languages talk to each other.

```recall
Q: What is WebAssembly?
A: A portable, sandboxed binary instruction format that languages like C, C++, Rust and C# compile to, running at near-native speed in browsers and other hosts.

Q: Can WebAssembly manipulate the DOM directly?
A: No. It calls into JavaScript (usually generated glue code) for DOM and most browser APIs.

Q: Give three good use cases for WebAssembly in the browser.
A: CPU-heavy work (image/video/audio processing, games, simulations), porting existing native libraries/apps to the web, and running non-JS languages such as C# (Blazor).

Q: What is WASI?
A: The WebAssembly System Interface, giving Wasm modules controlled access to system resources so they can run outside the browser, on servers and edge platforms.
```
