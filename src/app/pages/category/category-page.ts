import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { Difficulty } from '../../core/models';
import { UserDataService } from '../../core/user-data.service';
import { ArticleList } from '../../shared/article-list';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, Icon, ArticleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (category(); as c) {
      <header>
        <span class="cat-icon"><app-icon [name]="c.icon" [size]="26" /></span>
        <div>
          <h1>{{ c.title }}</h1>
          <p>{{ c.description }}</p>
          <div class="progress">
            <div class="bar"><div [style.width.%]="(studied() / c.count) * 100"></div></div>
            <span>{{ studied() }} of {{ c.count }} studied</span>
          </div>
        </div>
      </header>
      <div class="filters" role="group" aria-label="Filter by difficulty">
        @for (d of levels; track d) {
          <button type="button" class="chip" [class.on]="level() === d" (click)="level.set(level() === d ? null : d)">{{ d }}</button>
        }
      </div>
      <app-article-list [articles]="articles()" [showCategory]="false" emptyText="No entries at this level yet." />
    } @else {
      <h1>Category not found</h1>
      <p><a routerLink="/">Back to the codex</a></p>
    }
  `,
  styles: `
    :host { display: block; padding: 40px 40px 80px; max-width: 900px; }
    header { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 2rem; letter-spacing: -0.02em; color: var(--text-strong); }
    p { margin: 6px 0 0; color: var(--text-muted); line-height: 1.6; }
    .cat-icon { display: inline-grid; place-items: center; width: 54px; height: 54px; border-radius: 14px; background: var(--accent-soft); color: var(--accent-strong); flex-shrink: 0; }
    .progress { display: flex; align-items: center; gap: 12px; margin-top: 14px; font-size: .8rem; color: var(--text-faint); }
    .bar { width: 160px; height: 5px; border-radius: 4px; background: var(--surface-hover); overflow: hidden; div { height: 100%; background: var(--success); } }
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    @media (max-width: 600px) { :host { padding: 24px 16px 64px; } }
  `,
})
export class CategoryPage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);
  private readonly user = inject(UserDataService);

  protected readonly levels: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
  protected readonly level = signal<Difficulty | null>(null);
  protected readonly category = computed(() => this.content.category(this.id()));
  protected readonly articles = computed(() => {
    const level = this.level();
    return this.content.inCategory(this.id()).filter((a) => !level || a.difficulty === level);
  });
  protected readonly studied = computed(
    () => this.content.inCategory(this.id()).filter((a) => this.user.isStudied(a.slug)).length,
  );

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.category()?.title ?? 'Category'} · Developer Codex`));
  }
}
