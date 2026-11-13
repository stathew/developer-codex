import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../core/content.service';
import { ArticleMeta } from '../core/models';
import { UserDataService } from '../core/user-data.service';
import { Icon } from './icon';

@Component({
  selector: 'app-article-list',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="list" [class.compact]="compact()">
      @for (a of articles(); track a.slug) {
        <li>
          <a class="item" [routerLink]="['/a', a.slug]">
            <div class="title-row">
              <span class="title">{{ a.title }}</span>
              @if (a.type === 'html') { <span class="badge badge-accent"><app-icon name="play" [size]="11" /> Interactive</span> }
              @if (user.isStudied(a.slug)) { <span class="studied" title="Studied"><app-icon name="check-circle" [size]="15" /></span> }
            </div>
            @if (!compact()) { <p class="summary">{{ a.summary }}</p> }
            <div class="meta">
              @if (showCategory()) { <span>{{ content.category(a.category)?.title }}</span> }
              @if (a.difficulty) { <span class="difficulty" [attr.data-level]="a.difficulty">{{ a.difficulty }}</span> }
              <span>{{ a.readingMinutes }} min</span>
              @if (a.cards.length) { <span>{{ a.cards.length }} recall</span> }
            </div>
          </a>
        </li>
      } @empty {
        <li class="empty">{{ emptyText() }}</li>
      }
    </ul>
  `,
  styles: `
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .item {
      display: block; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius);
      background: var(--surface); color: inherit; text-decoration: none; transition: border-color .15s, transform .15s;
    }
    .item:hover { border-color: var(--accent); transform: translateY(-1px); }
    .title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .title { font-weight: 600; color: var(--text-strong); }
    .studied { color: var(--success); display: inline-flex; margin-left: auto; }
    .summary { margin: 6px 0 0; color: var(--text-muted); font-size: .9rem; line-height: 1.5; }
    .meta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: .78rem; color: var(--text-faint); text-transform: capitalize; }
    .compact .item { padding: 10px 14px; }
    .compact .meta { margin-top: 4px; }
    .empty { color: var(--text-muted); padding: 12px 0; }
  `,
})
export class ArticleList {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  readonly articles = input.required<ArticleMeta[]>();
  readonly showCategory = input(true);
  readonly compact = input(false);
  readonly emptyText = input('Nothing here yet.');
}
