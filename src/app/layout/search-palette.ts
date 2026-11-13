import {
  afterNextRender, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, signal, untracked, viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../core/content.service';
import { SearchService } from '../core/search.service';
import { UiService } from '../core/ui.service';
import { UserDataService } from '../core/user-data.service';
import { Icon } from '../shared/icon';

interface PaletteItem {
  key: string;
  icon: string;
  title: string;
  context?: string;
  snippet?: string;
  badge?: string;
  commands: string[];
  fragment?: string;
  queryParams?: Record<string, string>;
}

const MAX_RESULTS = 8;

@Component({
  selector: 'app-search-palette',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-palette.html',
  styleUrl: './search-palette.scss',
})
export class SearchPalette {
  protected readonly ui = inject(UiService);
  private readonly search = inject(SearchService);
  private readonly content = inject(ContentService);
  private readonly user = inject(UserDataService);
  private readonly router = inject(Router);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  protected readonly query = this.ui.paletteQuery;
  protected readonly active = signal(0);
  protected readonly error = signal(false);

  protected readonly items = computed<PaletteItem[]>(() => {
    const q = this.query().trim();
    if (!q) {
      const recent = this.user.recent().slice(0, 5).map((a) => ({
        key: 'recent:' + a.slug,
        icon: 'clock',
        title: a.title,
        context: this.content.category(a.category)?.title,
        commands: ['/a', ...a.slug.split('/')],
      }));
      return [
        ...recent,
        { key: 'go:review', icon: 'brain', title: 'Review due recall cards', badge: String(this.user.dueCards().length), commands: ['/review'] },
        { key: 'go:explore', icon: 'compass', title: 'Explore all entries and tags', commands: ['/search'] },
        { key: 'go:library', icon: 'library', title: 'My library — bookmarks & progress', commands: ['/library'] },
      ];
    }
    if (!this.search.ready()) return [];

    const groups = this.search.search(q).slice(0, MAX_RESULTS);
    const results: PaletteItem[] = groups.map((g) => {
      const best = g.sections[0];
      return {
        key: g.article.slug,
        icon: g.article.type === 'html' ? 'play' : 'book',
        title: g.article.title,
        context: [this.content.category(g.article.category)?.title, best.heading].filter(Boolean).join(' › '),
        snippet: best.snippet,
        badge: g.sections.length > 1 ? `${g.sections.length} sections` : undefined,
        commands: ['/a', ...g.article.slug.split('/')],
        fragment: best.anchor || undefined,
      };
    });
    results.push({
      key: 'all',
      icon: 'search',
      title: `See all results for “${q}”`,
      commands: ['/search'],
      queryParams: { q },
    });
    return results;
  });

  constructor() {
    const injector = inject(Injector);
    effect(() => {
      if (!this.ui.paletteOpen()) return;
      untracked(() => {
        this.active.set(0);
        this.search.ensureLoaded().catch(() => this.error.set(true));
      });
      afterNextRender(() => this.input()?.nativeElement.focus(), { injector });
    });
    effect(() => {
      this.items();
      untracked(() => this.active.set(0));
    });
  }

  protected onInput(value: string): void {
    this.query.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.items().length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!count) return;
      this.active.update((i) => (i + (event.key === 'ArrowDown' ? 1 : -1) + count) % count);
      queueMicrotask(() =>
        this.list()?.nativeElement.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }),
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.items()[this.active()];
      if (item) this.choose(item);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  protected choose(item: PaletteItem): void {
    this.close();
    this.router.navigate(item.commands, { fragment: item.fragment, queryParams: item.queryParams });
  }

  protected close(): void {
    this.ui.paletteOpen.set(false);
  }
}
