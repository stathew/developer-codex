// Text helpers. stripInlineMarkdown / slugify / createSlugger / parseRecall mirror
// scripts/build-content.mjs so search anchors match rendered heading ids — keep them in sync.

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim();
}

export function slugify(text: string): string {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}

export function parseRecall(source: string): { q: string; a: string }[] {
  const cards: { q: string; a: string }[] = [];
  let current: { q: string; a: string } | null = null;
  let field: 'q' | 'a' | null = null;
  for (const line of source.split(/\r?\n/)) {
    const m = /^\s*(Q|A)\s*:\s?(.*)$/.exec(line);
    if (m) {
      if (m[1] === 'Q') {
        current = { q: m[2], a: '' };
        cards.push(current);
        field = 'q';
      } else if (current) {
        current.a = m[2];
        field = 'a';
      }
      continue;
    }
    if (current && field) current[field] += '\n' + line;
  }
  return cards.map((c) => ({ q: c.q.trim(), a: c.a.trim() })).filter((c) => c.q && c.a);
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function stripFrontMatter(source: string): string {
  return source.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/** Resolves a relative path (e.g. "../backend/rest.md") against a directory ("frontend"). */
export function resolvePath(dir: string, relative: string): string {
  const parts = dir ? dir.split('/') : [];
  for (const segment of relative.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment && segment !== '.') parts.push(segment);
  }
  return parts.join('/');
}

export function dirOf(slug: string): string {
  const i = slug.lastIndexOf('/');
  return i < 0 ? '' : slug.slice(0, i);
}
