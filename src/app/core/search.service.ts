import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type MiniSearch from 'minisearch';
import type { SearchResult } from 'minisearch';
import { firstValueFrom } from 'rxjs';
import { ContentService } from './content.service';
import { ArticleMeta, ContentType, SearchDoc } from './models';
import { escapeHtml } from './text';

export interface SectionHit {
  heading: string;
  anchor: string;
  snippet: string;
  score: number;
}

export interface SearchGroup {
  article: ArticleMeta;
  score: number;
  sections: SectionHit[];
}

export interface SearchFilters {
  category?: string;
  type?: ContentType;
  tag?: string;
  difficulty?: string;
}

const SNIPPET_RADIUS = 80;

/** Full-text search over every section of every entry. The index is loaded on first use. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly content = inject(ContentService);
  private index?: MiniSearch<SearchDoc>;
  private loading?: Promise<void>;

  readonly ready = signal(false);

  ensureLoaded(): Promise<void> {
    this.loading ??= (async () => {
      const [{ default: MiniSearchCtor }, data] = await Promise.all([
        import('minisearch'),
        firstValueFrom(
          this.http.get<{ docs: SearchDoc[] }>(`content/search-index.json?v=${this.content.manifest().version}`),
        ),
      ]);
      const index = new MiniSearchCtor<SearchDoc>({
        fields: ['title', 'heading', 'tags', 'summary', 'text'],
        storeFields: ['slug', 'heading', 'anchor', 'text', 'category', 'type'],
        searchOptions: {
          boost: { title: 5, tags: 3, heading: 2.5, summary: 1.5 },
          prefix: true,
          fuzzy: 0.2,
        },
      });
      index.addAll(data.docs);
      this.index = index;
      this.ready.set(true);
    })().catch((err) => {
      this.loading = undefined;
      throw err;
    });
    return this.loading;
  }

  search(query: string, filters: SearchFilters = {}): SearchGroup[] {
    const q = query.trim();
    if (!this.index || !q) return [];

    const filter = (r: SearchResult) => {
      const meta = this.content.article(r['slug']);
      if (!meta) return false;
      if (filters.category && meta.category !== filters.category) return false;
      if (filters.type && meta.type !== filters.type) return false;
      if (filters.tag && !meta.tags.includes(filters.tag)) return false;
      if (filters.difficulty && meta.difficulty !== filters.difficulty) return false;
      return true;
    };

    let results = this.index.search(q, { combineWith: 'AND', filter });
    if (!results.length) results = this.index.search(q, { combineWith: 'OR', filter });

    const groups = new Map<string, SearchGroup>();
    for (const r of results) {
      const article = this.content.article(r['slug'])!;
      const group = groups.get(article.slug) ?? { article, score: 0, sections: [] };
      group.score = Math.max(group.score, r.score);
      group.sections.push({
        heading: r['heading'],
        anchor: r['anchor'],
        snippet: this.snippet(r['text'], r.terms),
        score: r.score,
      });
      groups.set(article.slug, group);
    }
    return [...groups.values()].sort((a, b) => b.score - a.score);
  }

  /** Builds an HTML-escaped excerpt around the first matched term, with matches wrapped in <mark>. */
  private snippet(text: string, terms: string[]): string {
    if (!text) return '';
    const lower = text.toLowerCase();
    const positions = terms.map((t) => lower.indexOf(t.toLowerCase())).filter((i) => i >= 0);
    const first = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, first - SNIPPET_RADIUS);
    const end = Math.min(text.length, first + SNIPPET_RADIUS * 2);
    let excerpt = escapeHtml(text.slice(start, end));
    const pattern = terms
      .filter((t) => t.length > 1)
      .map((t) => escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    if (pattern) excerpt = excerpt.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
    return `${start > 0 ? '…' : ''}${excerpt}${end < text.length ? '…' : ''}`;
  }
}
