#!/usr/bin/env node
/**
 * Developer Codex content indexer.
 *
 * Scans public/content for Markdown (.md) and interactive HTML (.html) entries and writes:
 *   - public/content/manifest.json      article metadata, categories and recall cards (loaded at startup)
 *   - public/content/search-index.json  section-level documents for the global search (loaded lazily)
 *
 * It also validates every link and image in Markdown entries (target entry exists, #anchor exists,
 * referenced file exists) plus `related` front matter. Broken links fail the build; in --watch mode
 * they're reported but the indexer keeps running.
 *
 * Usage:  node scripts/build-content.mjs [--watch]
 *
 * Files and folders starting with "_" or "." are ignored (e.g. _shared/ assets).
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { watch, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONTENT_DIR = path.join(ROOT, 'public', 'content');
const MANIFEST_FILE = path.join(CONTENT_DIR, 'manifest.json');
const SEARCH_FILE = path.join(CONTENT_DIR, 'search-index.json');
const CATEGORIES_FILE = path.join(CONTENT_DIR, 'categories.json');
const GENERATED = new Set(['manifest.json', 'search-index.json']);
const DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced']);
/** App routes that entries may link to directly (besides /a/<slug> and /c/<category>). */
const APP_ROUTES = new Set(['/', '/search', '/review', '/library']);
const STATUSES = new Set(['needs-review']);
const WORDS_PER_MINUTE = 220;

// ---------------------------------------------------------------------------
// Helpers shared (by convention) with src/app/core/text.ts — keep them in sync.
// ---------------------------------------------------------------------------

export function stripInlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim();
}

export function slugify(text) {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function createSlugger() {
  const seen = new Map();
  return (text) => {
    const base = slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}

export function parseRecall(source) {
  const cards = [];
  let current = null;
  let field = null;
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

// ---------------------------------------------------------------------------

function hash(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((v) => unquote(v.trim()))
      .filter(Boolean);
  }
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return unquote(value);
}

function unquote(value) {
  return /^(['"]).*\1$/.test(value) ? value.slice(1, -1) : value;
}

/** A deliberately tiny YAML subset: `key: value` and `key: [a, b]` per line. */
export function parseFrontMatterBlock(text) {
  const data = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) continue;
    data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
  }
  return data;
}

export function splitMarkdownFrontMatter(source) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!m) return { data: {}, body: source };
  return { data: parseFrontMatterBlock(m[1]), body: source.slice(m[0].length) };
}

export function toPlainText(markdown) {
  return markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[!(\w+)\]/g, '')
    .replace(/^\s{0,3}(#{1,6}|>+|[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*\|?[\s:-]+\|[\s|:-]*$/gm, '')
    .replace(/[|`*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function analyzeMarkdown(body) {
  const slug = createSlugger();
  const sections = [{ heading: '', anchor: '', lines: [] }];
  const cards = [];
  const anchors = new Set();
  const links = [];
  let fence = null;

  body.split(/\r?\n/).forEach((line, index) => {
    if (fence) {
      const trimmed = line.trim();
      const closes =
        /^(```+|~~~+)$/.test(trimmed) && trimmed[0] === fence.marker[0] && trimmed.length >= fence.marker.length;
      if (closes) {
        if (fence.lang === 'recall') {
          const parsed = parseRecall(fence.lines.join('\n'));
          cards.push(...parsed);
          sections.at(-1).lines.push(...parsed.flatMap((c) => [c.q, c.a]));
        } else {
          sections.at(-1).lines.push(...fence.lines);
        }
        fence = null;
      } else {
        fence.lines.push(line);
      }
      return;
    }

    const open = /^\s*(```+|~~~+)\s*([\w+#-]*)/.exec(line);
    if (open) {
      fence = { marker: open[1], lang: open[2].toLowerCase(), lines: [] };
      return;
    }

    links.push(...extractLinks(line, index + 1));

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const anchor = slug(heading[2]);
      anchors.add(anchor);
      if (heading[1].length <= 3) {
        sections.push({ heading: stripInlineMarkdown(heading[2]), anchor, lines: [] });
        return;
      }
    }
    sections.at(-1).lines.push(line);
  });

  return {
    anchors,
    links,
    sections: sections
      .map((s) => ({ heading: s.heading, anchor: s.anchor, text: toPlainText(s.lines.join('\n')) }))
      .filter((s) => s.heading || s.text),
    cards,
  };
}

export function analyzeHtml(source) {
  const fm = /<!--\s*---\r?\n([\s\S]*?)\r?\n---\s*-->/.exec(source);
  const data = fm ? parseFrontMatterBlock(fm[1]) : {};
  if (!data.title) {
    const t = /<title>([\s\S]*?)<\/title>/i.exec(source);
    if (t) data.title = t[1].trim();
  }
  const cards = [];
  for (const m of source.matchAll(/<script[^>]*type=["']text\/x-recall["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    cards.push(...parseRecall(m[1]));
  }
  const text = source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { data, sections: [{ heading: '', anchor: '', text }], cards };
}

/** Finds Markdown links and images on one line, ignoring inline code spans. */
export function extractLinks(line, lineNumber = 0) {
  const text = line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
  const found = [];
  for (const m of text.matchAll(/(!?)\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g)) {
    found.push({ href: m[2], image: m[1] === '!', line: lineNumber });
  }
  return found;
}

/**
 * Resolves a link in entry `fromSlug` the way the app renders it (see MarkdownService).
 * Returns null for links that aren't checked (external URLs, mailto:, …).
 */
export function resolveLink(fromSlug, href, { image = false } = {}) {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return null;
  const [target, anchor = ''] = href.split('#');
  if (!target) return { kind: 'entry', slug: fromSlug, anchor };
  if (target.startsWith('/')) {
    if (image) return { kind: 'file', file: target.slice(1), root: 'public' };
    if (target.startsWith('/a/')) return { kind: 'entry', slug: target.slice(3), anchor };
    if (target.startsWith('/c/')) return { kind: 'category', id: target.slice(3) };
    return { kind: 'route', route: target };
  }
  const dir = fromSlug.includes('/') ? fromSlug.slice(0, fromSlug.lastIndexOf('/')) : '';
  const resolved = path.posix.normalize(path.posix.join(dir, target));
  if (!image && /\.(md|html)$/i.test(resolved)) {
    return { kind: 'entry', slug: resolved.replace(/\.(md|html)$/i, ''), anchor };
  }
  return { kind: 'file', file: resolved, root: 'content' };
}

/**
 * Checks one entry's links against the known entries.
 * `entries` maps slug → { type, anchors: Set }, `categories` is a Set of ids,
 * `fileExists(root, relPath)` checks files under public/ ('public') or public/content/ ('content').
 */
export function validateLinks(fromSlug, links, { entries, categories, fileExists }) {
  const errors = [];
  for (const link of links) {
    const target = resolveLink(fromSlug, link.href, link);
    if (!target) continue;
    const where = `${fromSlug}${link.line ? ':' + link.line : ''}`;
    if (target.kind === 'entry') {
      const entry = entries.get(target.slug);
      if (!entry) errors.push(`${where}: link to missing entry "${link.href}"`);
      else if (target.anchor && entry.type !== 'markdown') {
        errors.push(`${where}: "${link.href}" links to a heading in an interactive entry, which has no headings`);
      } else if (target.anchor && !entry.anchors.has(target.anchor)) {
        errors.push(`${where}: link to missing heading "#${target.anchor}" in "${target.slug}"`);
      }
    } else if (target.kind === 'category' && !categories.has(target.id)) {
      errors.push(`${where}: link to missing category "${link.href}"`);
    } else if (target.kind === 'route' && !APP_ROUTES.has(target.route)) {
      errors.push(`${where}: link to unknown app route "${link.href}"`);
    } else if (target.kind === 'file' && !fileExists(target.root, target.file)) {
      errors.push(`${where}: ${link.image ? 'image' : 'link'} to missing file "${link.href}"`);
    }
  }
  return errors;
}

function titleCase(id) {
  return id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function walk(dir, rel = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await walk(abs, relPath)));
    else if (/\.(md|html)$/i.test(entry.name)) out.push({ abs, rel: relPath });
  }
  return out;
}

export async function build() {
  const started = performance.now();
  const warnings = [];
  const errors = [];
  const linkInfo = new Map();
  const files = await walk(CONTENT_DIR);
  const articles = [];
  const searchDocs = [];

  for (const file of files) {
    const source = await readFile(file.abs, 'utf8');
    const isHtml = file.rel.toLowerCase().endsWith('.html');
    const slug = file.rel.replace(/\.(md|html)$/i, '');
    const folder = slug.includes('/') ? slug.split('/')[0] : '';

    let data, sections, cards;
    let anchors = new Set();
    let links = [];
    if (isHtml) {
      ({ data, sections, cards } = analyzeHtml(source));
    } else {
      const fm = splitMarkdownFrontMatter(source);
      data = fm.data;
      ({ sections, cards, anchors, links } = analyzeMarkdown(fm.body));
      // Report line numbers relative to the file, not the body.
      const offset = source.slice(0, source.length - fm.body.length).split(/\r?\n/).length - 1;
      links = links.map((l) => ({ ...l, line: l.line + offset }));
    }
    linkInfo.set(slug, { type: isHtml ? 'html' : 'markdown', anchors, links });

    if (!data.title) warnings.push(`${file.rel}: missing "title" (derived from file name)`);
    if (data.draft === true) continue;

    const words = sections.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
    const mtime = (await stat(file.abs)).mtime;
    const difficulty = DIFFICULTIES.has(data.difficulty) ? data.difficulty : undefined;
    if (data.difficulty && !difficulty) warnings.push(`${file.rel}: unknown difficulty "${data.difficulty}"`);
    const status = STATUSES.has(data.status) ? data.status : undefined;
    if (data.status && !status) warnings.push(`${file.rel}: unknown status "${data.status}"`);

    const article = {
      slug,
      type: isHtml ? 'html' : 'markdown',
      title: String(data.title ?? titleCase(path.basename(slug))),
      summary: String(data.summary ?? sections.find((s) => s.text)?.text.slice(0, 180) ?? ''),
      category: String(data.category ?? (folder || 'general')),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      difficulty,
      status,
      reviewNotes: data.reviewNotes ? String(data.reviewNotes) : undefined,
      updated: String(data.updated ?? mtime.toISOString().slice(0, 10)),
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      order: typeof data.order === 'number' ? data.order : 100,
      path: `content/${file.rel}`,
      related: Array.isArray(data.related) ? data.related.map(String) : [],
      cards: cards.map((c) => ({ id: `${slug}::${hash(c.q)}`, ...c })),
    };
    articles.push(article);

    sections.forEach((s, i) =>
      searchDocs.push({
        id: `${slug}#${i}`,
        slug,
        title: article.title,
        heading: s.heading,
        anchor: s.anchor,
        text: s.text,
        tags: article.tags.join(' '),
        summary: i === 0 ? article.summary : '',
        category: article.category,
        type: article.type,
      }),
    );
  }

  const known = new Set(articles.map((a) => a.slug));
  for (const a of articles) {
    for (const r of a.related) if (!known.has(r)) errors.push(`${a.slug}: related entry "${r}" not found`);
    a.related = a.related.filter((r) => known.has(r));
  }

  const defined = existsSync(CATEGORIES_FILE) ? JSON.parse(await readFile(CATEGORIES_FILE, 'utf8')) : [];
  const categories = new Map(defined.map((c, i) => [c.id, { icon: 'book', description: '', order: i, ...c }]));
  for (const a of articles) {
    if (!categories.has(a.category)) {
      categories.set(a.category, { id: a.category, title: titleCase(a.category), description: '', icon: 'book', order: 999 });
    }
  }
  const categoryList = [...categories.values()]
    .map((c) => ({ ...c, count: articles.filter((a) => a.category === c.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const categoryIds = new Set(categoryList.map((c) => c.id));
  const fileExists = (root, rel) => existsSync(path.join(root === 'public' ? PUBLIC_DIR : CONTENT_DIR, rel));
  let linkCount = 0;
  for (const [slug, info] of linkInfo) {
    if (!known.has(slug)) continue; // drafts
    linkCount += info.links.length;
    errors.push(...validateLinks(slug, info.links, { entries: linkInfo, categories: categoryIds, fileExists }));
  }

  articles.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order || a.title.localeCompare(b.title));

  const body = { categories: categoryList, articles };
  const version = hash(JSON.stringify(body) + JSON.stringify(searchDocs));
  const wroteManifest = await writeIfChanged(MANIFEST_FILE, JSON.stringify({ version, ...body }, null, 2));
  const wroteSearch = await writeIfChanged(SEARCH_FILE, JSON.stringify({ version, docs: searchDocs }));

  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  const ms = Math.round(performance.now() - started);
  const status = wroteManifest || wroteSearch ? 'updated' : 'unchanged';
  console.log(
    `[codex] ${articles.length} entries, ${categoryList.length} categories, ` +
      `${articles.reduce((n, a) => n + a.cards.length, 0)} recall cards, ${searchDocs.length} search sections, ` +
      `${linkCount} links checked — ${status} (${ms}ms)`,
  );
  if (errors.length) console.error(`[codex] ${errors.length} broken link${errors.length === 1 ? '' : 's'}`);
  return { errors, warnings };
}

async function writeIfChanged(file, content) {
  if (existsSync(file) && (await readFile(file, 'utf8')) === content) return false;
  await writeFile(file, content);
  return true;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
const watchMode = process.argv.includes('--watch');

if (isMain) {
  const { errors } = await build();
  if (errors.length && !watchMode) process.exitCode = 1;
}

if (isMain && watchMode) {
  let timer;
  console.log(`[codex] watching ${path.relative(ROOT, CONTENT_DIR)} for changes…`);
  watch(CONTENT_DIR, { recursive: true }, (_event, file) => {
    if (!file || GENERATED.has(path.basename(file))) return;
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((e) => console.error('[codex] build failed:', e)), 150);
  });
}
