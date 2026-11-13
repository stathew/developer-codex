import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  let markdown: MarkdownService;

  /** Renders into a detached element so tests can query the DOM. */
  function render(source: string, slug = 'backend/rest-api-design') {
    const result = markdown.render(source, slug);
    const el = document.createElement('div');
    el.innerHTML = result.html;
    return { ...result, el };
  }

  beforeEach(() => {
    markdown = TestBed.inject(MarkdownService);
  });

  describe('headings', () => {
    it('gives headings stable ids and builds the TOC from h2/h3 only', () => {
      const { headings, el } = render('## Status codes\n### 4xx `errors`\n#### Deep\n## Status codes');
      expect(headings).toEqual([
        { id: 'status-codes', depth: 2, text: 'Status codes' },
        { id: '4xx-errors', depth: 3, text: '4xx errors' },
        { id: 'status-codes-1', depth: 2, text: 'Status codes' },
      ]);
      expect(el.querySelector('h4')?.id).toBe('deep');
      expect(el.querySelector('h2 a.anchor')?.getAttribute('href')).toBe('#status-codes');
    });

    it('resets duplicate tracking between renders', () => {
      render('## Intro');
      expect(render('## Intro').headings[0].id).toBe('intro');
    });
  });

  describe('links', () => {
    it('turns relative entry links into base-relative hrefs with an app route', () => {
      const a = render('[SOLID](../design/solid-principles.md#d-dependency-inversion-principle)').el.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('a/design/solid-principles#d-dependency-inversion-principle');
      expect(a.dataset['route']).toBe('/a/design/solid-principles#d-dependency-inversion-principle');
    });

    it('resolves same-folder and interactive (.html) entry links', () => {
      const links = render('[gRPC](grpc.md) [Viz](../fundamentals/sorting-visualizer.html)').el.querySelectorAll('a');
      expect(links[0].dataset['route']).toBe('/a/backend/grpc');
      expect(links[1].dataset['route']).toBe('/a/fundamentals/sorting-visualizer');
    });

    it('keeps absolute app routes as in-app navigation', () => {
      const a = render('[Review](/review)').el.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('review');
      expect(a.dataset['route']).toBe('/review');
    });

    it('opens external links in a new tab safely', () => {
      const a = render('[Docs](https://example.com)').el.querySelector('a')!;
      expect(a.target).toBe('_blank');
      expect(a.rel).toContain('noopener');
      expect(a.dataset['route']).toBeUndefined();
    });

    it('resolves non-entry files and images relative to the entry folder', () => {
      const { el } = render('[Sheet](files/cheatsheet.pdf) ![Diagram](img/flow.png) ![Logo](/favicon.svg)');
      expect(el.querySelector('a')!.getAttribute('href')).toBe('content/backend/files/cheatsheet.pdf');
      const imgs = el.querySelectorAll('img');
      expect(imgs[0].getAttribute('src')).toBe('content/backend/img/flow.png');
      expect(imgs[1].getAttribute('src')).toBe('favicon.svg');
      expect(imgs[0].getAttribute('loading')).toBe('lazy');
    });
  });

  describe('code blocks', () => {
    it('highlights known languages and adds a copy button', () => {
      const { el } = render('```ts\nconst x: number = 1;\n```');
      expect(el.querySelector('.code-head span')?.textContent).toBe('ts');
      expect(el.querySelector('[data-copy]')).not.toBeNull();
      expect(el.querySelector('code.language-ts .hljs-keyword')?.textContent).toBe('const');
    });

    it('escapes code in unknown languages instead of injecting it', () => {
      const { el } = render('```unknownlang\n<script>alert(1)</script>\n```');
      expect(el.querySelector('script')).toBeNull();
      expect(el.querySelector('code')?.textContent).toContain('<script>alert(1)</script>');
    });

    it('supports the language aliases used in entries', () => {
      for (const lang of ['proto', 'gql', 'razor', 'sh', 'tsx']) {
        const { el } = render('```' + lang + '\nx\n```');
        expect(el.querySelector('code')?.className, lang).toMatch(/language-/);
      }
    });
  });

  describe('Codex extensions', () => {
    it('renders recall blocks as collapsible self-test cards', () => {
      const { el } = render('```recall\nQ: What is **idempotency**?\nA: Same effect\nwhen repeated.\n\nQ: Second?\nA: Yes\n```');
      const cards = el.querySelectorAll('details.recall');
      expect(cards.length).toBe(2);
      expect(cards[0].querySelector('summary strong')?.textContent).toBe('idempotency');
      expect(cards[0].querySelector('.recall-a')?.textContent).toContain('Same effect');
    });

    it('renders interview blocks like recall cards, labelled as interview questions', () => {
      const { el } = render('````interview\nQ: Design a cache?\nA: Use:\n```ts\nconst x = 1;\n```\n````');
      const card = el.querySelector('details.recall.interview')!;
      expect(card.querySelector('.recall-tag')?.textContent).toBe('Interview');
      expect(card.querySelector('.recall-a pre code')?.textContent).toContain('const x = 1;');
    });

    it('turns GitHub-style alerts into callouts, including the AI type', () => {
      const { el } = render('> [!AI]\n> Check generated code.\n\n> [!WARNING]\n> Careful.\n\n> Plain quote');
      const callouts = el.querySelectorAll('blockquote.callout');
      expect([...callouts].map((c) => c.querySelector('.callout-title')?.textContent)).toEqual(['AI angle', 'Warning']);
      expect(el.querySelectorAll('blockquote').length).toBe(3);
    });

    it('leaves unknown alert types as plain blockquotes', () => {
      expect(render('> [!BOGUS]\n> text').el.querySelector('.callout')).toBeNull();
    });

    it('wraps tables for horizontal scrolling', () => {
      expect(render('| a | b |\n|---|---|\n| 1 | 2 |').el.querySelector('.table-wrap > table')).not.toBeNull();
    });
  });
});
