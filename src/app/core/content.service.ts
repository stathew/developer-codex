import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleMeta, Category, Manifest } from './models';

/** Loads the generated content manifest and serves article metadata and sources. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly sources = new Map<string, Promise<string>>();

  readonly manifest = signal<Manifest>({ version: '', categories: [], articles: [] });
  readonly articles = computed(() => this.manifest().articles);
  readonly categories = computed(() => this.manifest().categories);
  readonly totalCards = computed(() => this.articles().reduce((n, a) => n + a.cards.length, 0));

  private readonly bySlug = computed(() => new Map(this.articles().map((a) => [a.slug, a])));
  private readonly byCategory = computed(() => {
    const map = new Map<string, ArticleMeta[]>();
    for (const a of this.articles()) map.set(a.category, [...(map.get(a.category) ?? []), a]);
    return map;
  });

  readonly tags = computed(() => {
    const counts = new Map<string, number>();
    for (const a of this.articles()) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  });

  readonly recentlyUpdated = computed(() =>
    [...this.articles()].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6),
  );

  readonly interactive = computed(() => this.articles().filter((a) => a.type === 'html'));

  async load(): Promise<void> {
    const manifest = await firstValueFrom(this.http.get<Manifest>(`content/manifest.json?t=${Date.now()}`));
    this.manifest.set(manifest);
  }

  article(slug: string): ArticleMeta | undefined {
    return this.bySlug().get(slug);
  }

  category(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  inCategory(id: string): ArticleMeta[] {
    return this.byCategory().get(id) ?? [];
  }

  withTag(tag: string): ArticleMeta[] {
    return this.articles().filter((a) => a.tags.includes(tag));
  }

  /** Previous/next entries within the same category, in reading order. */
  neighbours(slug: string): { prev?: ArticleMeta; next?: ArticleMeta } {
    const meta = this.article(slug);
    if (!meta) return {};
    const list = this.inCategory(meta.category);
    const i = list.findIndex((a) => a.slug === slug);
    return { prev: list[i - 1], next: list[i + 1] };
  }

  source(meta: ArticleMeta): Promise<string> {
    const key = meta.path;
    if (!this.sources.has(key)) {
      const request = firstValueFrom(
        this.http.get(`${meta.path}?v=${this.manifest().version}`, { responseType: 'text' }),
      ).catch((err) => {
        this.sources.delete(key);
        throw err;
      });
      this.sources.set(key, request);
    }
    return this.sources.get(key)!;
  }
}
