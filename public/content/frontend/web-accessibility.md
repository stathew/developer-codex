---
title: Web Accessibility
summary: Building interfaces everyone can use — WCAG 2.2 and its POUR principles, semantic HTML, keyboard support, ARIA used sparingly, contrast, and how to test.
difficulty: beginner
tags: [accessibility, a11y, html, frontend, wcag]
order: 8
related: [frontend/browser-rendering-pipeline, frontend/choosing-a-frontend-framework, testing/automated-testing]
status: needs-review
reviewNotes: New entry from the topic-gaps batch. WCAG 2.2 confirmed as the current W3C Recommendation (WCAG 3 still a working draft) and EAA date checked on 2026-11-13.
---

**Accessibility (a11y)** means people can use your product regardless of disability: blindness and low vision, deafness, motor impairments, cognitive differences, and temporary or situational limits such as a broken arm or bright sunlight. Around one in six people worldwide lives with a significant disability. Accessible design also improves usability, SEO and robustness for everyone.

It's increasingly a **legal requirement**. In the EU, the **European Accessibility Act** has applied to many private-sector digital products and services (including e-commerce and banking) since **28 June 2025**.

## WCAG and POUR

The **Web Content Accessibility Guidelines** (WCAG) from the W3C are the global standard. **WCAG 2.2** is the current Recommendation, and most legal requirements reference **level AA**. WCAG 3 is still a working draft.

WCAG is organised around four principles, **POUR**:

| Principle | Meaning | Examples |
| --- | --- | --- |
| **Perceivable** | Users can perceive the content | Text alternatives for images, captions, sufficient contrast |
| **Operable** | Users can operate the interface | Full keyboard access, no keyboard traps, enough time, visible focus |
| **Understandable** | Content and behaviour are predictable | Clear labels and errors, consistent navigation |
| **Robust** | Works with assistive technologies | Valid semantics, correct names and roles |

## Semantic HTML first

Native elements come with keyboard support, focus handling and screen-reader semantics built in:

```html
<!-- ❌ Looks like a button, isn't one: no keyboard, no role, no focus -->
<div class="btn" onclick="save()">Save</div>

<!-- ✅ -->
<button type="button" (click)="save()">Save</button>
```

- Use landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`.
- Use a logical heading hierarchy (`h1` → `h2` → `h3`); screen-reader users navigate by headings.
- Label form controls with `<label for>`, and associate errors with `aria-describedby`.
- Use `<a href>` for navigation and `<button>` for actions.

## Images and media

- Informative images need meaningful `alt` text; decorative images need `alt=""`.
- Videos need captions; audio needs transcripts.
- Don't convey information by colour alone (e.g. red text for errors needs an icon or a message too).

## Keyboard and focus

- Everything interactive must be reachable and usable with **Tab, Shift+Tab, Enter, Space and arrow keys**.
- **Never remove focus outlines** without a visible replacement (`:focus-visible`).
- Dialogs must move focus inside, trap it while open, close on Esc and return focus when closed. The native `<dialog>` element helps.
- Provide a "skip to content" link (this codex has one; press Tab on any page).

## ARIA: the first rule

> If you can use a native HTML element with the semantics and behaviour you need, do that instead of ARIA.

ARIA adds semantics (`role`, `aria-expanded`, `aria-live`); it does **not** add behaviour. Bad ARIA is worse than none. Use it for patterns HTML lacks (tabs, comboboxes, live regions) and follow the ARIA Authoring Practices Guide.

## Contrast and text

- At least **4.5:1** contrast for normal text and **3:1** for large text and UI components (level AA).
- Support zooming to 200% and reflow at narrow widths without horizontal scrolling.
- Respect `prefers-reduced-motion`.

## Testing

1. **Automated:** axe (browser extension or in tests), Lighthouse, eslint plugins. These catch roughly a third of issues.
2. **Keyboard-only:** unplug the mouse and complete key tasks.
3. **Screen reader:** NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android).
4. **Zoom and contrast checks.**
5. Best of all, involve disabled users in testing.

> [!AI]
> AI-generated UI code frequently uses clickable `<div>`s, missing labels and placeholder-as-label inputs. Review generated components with the keyboard and with axe before merging.

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: How would you make sure a new feature is accessible?
A: Build it in from the start rather than auditing at the end.
- Use **semantic HTML** first (buttons, links, labels, headings, landmarks); ARIA only for patterns HTML lacks.
- Ensure full **keyboard** support and visible focus; manage focus for dialogs and route changes.
- Check **contrast**, text alternatives, captions, zoom/reflow and reduced motion.
- Test with **axe/Lighthouse**, then keyboard-only and a screen reader (NVDA/VoiceOver); include accessibility in the definition of done.
```

```recall
Q: What does POUR stand for in WCAG?
A: Perceivable, Operable, Understandable, Robust.

Q: What is the first rule of ARIA?
A: Don't use ARIA if a native HTML element with the needed semantics and behaviour exists.

Q: What contrast ratio does WCAG AA require for normal text?
A: At least 4.5:1 (3:1 for large text and UI components).

Q: Which WCAG version and level do most legal requirements reference?
A: WCAG 2.x level AA (WCAG 2.2 is the current Recommendation).

Q: What alt text should a purely decorative image have?
A: An empty alt attribute (alt=""), so screen readers skip it.

Q: Roughly what share of accessibility issues do automated tools catch?
A: Only around a third — manual keyboard and screen-reader testing is essential.
```
