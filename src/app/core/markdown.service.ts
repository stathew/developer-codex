import { Injectable } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import protobuf from 'highlight.js/lib/languages/protobuf';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { Marked, RendererObject, Tokens } from 'marked';
import { RenderedDoc, TocHeading } from './models';
import { createSlugger, dirOf, escapeHtml, parseRecall, resolvePath, stripInlineMarkdown } from './text';

const LANGUAGES = {
  bash, csharp, css, dockerfile, go, graphql, java, javascript, json, markdown, plaintext, protobuf, python, rust, scss, sql, typescript, xml, yaml,
};
for (const [name, lang] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, lang);
// No core highlight.js grammar for Razor; highlighting it as HTML colours the markup and leaves C# plain.
hljs.registerAliases(['html', 'angular', 'razor', 'cshtml'], { languageName: 'xml' });
hljs.registerAliases(['ts'], { languageName: 'typescript' });
hljs.registerAliases(['proto'], { languageName: 'protobuf' });
hljs.registerAliases(['gql'], { languageName: 'graphql' });
hljs.registerAliases(['js'], { languageName: 'javascript' });
hljs.registerAliases(['sh', 'shell', 'powershell', 'console'], { languageName: 'bash' });
hljs.registerAliases(['text', 'txt'], { languageName: 'plaintext' });

const CALLOUTS: Record<string, string> = {
  NOTE: 'Note',
  TIP: 'Tip',
  IMPORTANT: 'Important',
  WARNING: 'Warning',
  CAUTION: 'Caution',
  AI: 'AI angle',
  RECALL: 'Recall',
};

interface RenderContext {
  dir: string;
  slug: (text: string) => string;
  headings: TocHeading[];
}

/**
 * Renders Codex Markdown to HTML. Beyond GFM it supports:
 *  - heading anchors + table of contents
 *  - highlighted code blocks with a copy button
 *  - ```recall blocks (Q:/A: pairs) rendered as self-test cards
 *  - GitHub-style callouts: > [!NOTE], [!TIP], [!WARNING], [!AI] ...
 *  - relative links to other entries (../backend/rest.md) mapped to app routes
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private ctx: RenderContext = { dir: '', slug: createSlugger(), headings: [] };

  /** Lightweight instance for nested content (recall answers, flashcards). */
  private readonly basic = new Marked({ gfm: true, renderer: { code: (t) => this.codeBlock(t, false) } });

  private readonly full = new Marked({ gfm: true, renderer: this.createRenderer() });

  render(source: string, slug: string): RenderedDoc {
    this.ctx = { dir: dirOf(slug), slug: createSlugger(), headings: [] };
    const html = this.full.parse(source, { async: false }) as string;
    return { html: this.postProcess(html), headings: this.ctx.headings };
  }

  renderFragment(source: string): string {
    return this.basic.parse(source, { async: false }) as string;
  }

  renderInline(source: string): string {
    return this.basic.parseInline(source, { async: false }) as string;
  }

  private createRenderer(): RendererObject {
    const self = this;
    return {
      heading(token: Tokens.Heading) {
        const id = self.ctx.slug(token.text);
        const inner = this.parser.parseInline(token.tokens);
        if (token.depth === 2 || token.depth === 3) {
          self.ctx.headings.push({ id, depth: token.depth, text: stripInlineMarkdown(token.text) });
        }
        return `<h${token.depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${inner}</h${token.depth}>\n`;
      },
      code(token: Tokens.Code) {
        const lang = token.lang?.trim().toLowerCase();
        if (lang === 'recall') return self.recallBlock(token.text);
        if (lang === 'interview') return self.recallBlock(token.text, 'interview');
        return self.codeBlock(token, true);
      },
      link(token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens);
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        const href = token.href;
        if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
          return `<a href="${escapeHtml(href)}"${title} target="_blank" rel="noopener noreferrer" class="external">${text}</a>`;
        }
        const route = self.appRoute(href);
        if (route) {
          // Relative href so it works under any <base href> (e.g. GitHub Pages sub-path); data-route drives in-app navigation.
          return `<a href="${escapeHtml(route.slice(1))}" data-route="${escapeHtml(route)}"${title}>${text}</a>`;
        }
        return `<a href="${escapeHtml(self.resolveLink(href))}"${title}>${text}</a>`;
      },
      image(token: Tokens.Image) {
        const href = token.href;
        const src = /^[a-z]+:/i.test(href) ? href : href.startsWith('/') ? href.slice(1) : `content/${resolvePath(self.ctx.dir, href)}`;
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}"${title} loading="lazy">`;
      },
    };
  }

  /** Maps entry links ("../backend/rest.md#x") and absolute app links ("/review") to app routes ("/a/backend/rest#x"). */
  private appRoute(href: string): string | null {
    if (href.startsWith('/') && !href.startsWith('//')) return href;
    const [path, hash = ''] = href.split('#');
    if (!/\.(md|html)$/i.test(path)) return null;
    const slug = resolvePath(this.ctx.dir, path).replace(/\.(md|html)$/i, '');
    return `/a/${slug}${hash ? '#' + hash : ''}`;
  }

  /** Resolves links to other files (images, downloads) relative to the entry's folder. */
  private resolveLink(href: string): string {
    if (href.startsWith('#')) return href;
    const [path, hash = ''] = href.split('#');
    return `content/${resolvePath(this.ctx.dir, path)}${hash ? '#' + hash : ''}`;
  }

  private codeBlock(token: Tokens.Code, withHeader: boolean): string {
    const lang = (token.lang ?? '').trim().split(/\s+/)[0].toLowerCase();
    const known = lang && hljs.getLanguage(lang);
    const highlighted = known
      ? hljs.highlight(token.text, { language: lang, ignoreIllegals: true }).value
      : escapeHtml(token.text);
    const code = `<pre><code class="hljs${known ? ' language-' + lang : ''}">${highlighted}</code></pre>`;
    if (!withHeader) return code;
    return (
      `<div class="code-block"><div class="code-head"><span>${escapeHtml(lang || 'code')}</span>` +
      `<button type="button" class="copy-btn" data-copy>Copy</button></div>${code}</div>\n`
    );
  }

  private recallBlock(source: string, kind: 'recall' | 'interview' = 'recall'): string {
    const label = kind === 'interview' ? 'Interview' : 'Recall';
    const cards = parseRecall(source)
      .map(
        (c) =>
          `<details class="recall ${kind}"><summary><span class="recall-tag">${label}</span><span class="recall-q">${this.renderInline(c.q)}</span></summary>` +
          `<div class="recall-a">${this.renderFragment(c.a)}</div></details>`,
      )
      .join('');
    return `<div class="recall-block">${cards}</div>\n`;
  }

  private postProcess(html: string): string {
    return html
      .replace(/<blockquote>\s*<p>\[!(\w+)\]\s*/g, (match, kind: string) => {
        const label = CALLOUTS[kind.toUpperCase()];
        if (!label) return match;
        return `<blockquote class="callout callout-${kind.toLowerCase()}"><p class="callout-title">${label}</p><p>`;
      })
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<table>/g, '<div class="table-wrap"><table>')
      .replace(/<\/table>/g, '</table></div>');
  }
}
