import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ContentType } from '../../core/models';
import { SearchService } from '../../core/search.service';
import { ArticleList } from '../../shared/article-list';
import { Icon } from '../../shared/icon';

/** Full search & browse page. All state lives in query params so results are linkable. */
@Component({
  selector: 'app-search-page',
  imports: [RouterLink, Icon, ArticleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  readonly q = input<string>();
  readonly category = input<string>();
  readonly type = input<ContentType>();
  readonly tag = input<string>();
  readonly difficulty = input<string>();

  protected readonly content = inject(ContentService);
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);
  protected readonly failed = signal(false);

  private readonly filters = computed(() => ({
    category: this.category(),
    type: this.type(),
    tag: this.tag(),
    difficulty: this.difficulty(),
  }));

  protected readonly hasFilters = computed(() => Object.values(this.filters()).some(Boolean));

  protected readonly groups = computed(() => {
    const q = this.q()?.trim();
    if (!q || !this.search.ready()) return [];
    return this.search.search(q, this.filters());
  });

  /** Without a query, browse by filters over the manifest. */
  protected readonly browse = computed(() => {
    const f = this.filters();
    return this.content
      .articles()
      .filter(
        (a) =>
          (!f.category || a.category === f.category) &&
          (!f.type || a.type === f.type) &&
          (!f.tag || a.tags.includes(f.tag)) &&
          (!f.difficulty || a.difficulty === f.difficulty),
      );
  });

  protected readonly searching = computed(() => !!this.q()?.trim());

  constructor() {
    this.search.ensureLoaded().catch(() => this.failed.set(true));
  }

  protected update(params: Record<string, string | null | undefined>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected onQuery(value: string): void {
    this.update({ q: value || null });
  }

  protected clearFilters(): void {
    this.update({ category: null, type: null, tag: null, difficulty: null });
  }

  protected categoryTitle(id: string): string {
    return this.content.category(id)?.title ?? id;
  }
}
