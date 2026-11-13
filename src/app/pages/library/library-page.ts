import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { UserDataService } from '../../core/user-data.service';
import { ArticleList } from '../../shared/article-list';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-library-page',
  imports: [RouterLink, Icon, ArticleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library-page.html',
  styleUrl: './library-page.scss',
})
export class LibraryPage {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  protected readonly message = signal('');

  protected readonly bookmarks = computed(() =>
    this.user.bookmarks().map((s) => this.content.article(s)).filter((a) => !!a),
  );
  protected readonly studied = computed(() =>
    Object.entries(this.user.state().studied)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([s]) => this.content.article(s))
      .filter((a) => !!a),
  );
  protected readonly history = computed(() => this.user.recent().slice(0, 12));

  protected readonly byCategory = computed(() =>
    this.content.categories().map((c) => {
      const studied = this.content.inCategory(c.id).filter((a) => this.user.isStudied(a.slug)).length;
      return { ...c, studied, pct: Math.round((studied / c.count) * 100) };
    }),
  );

  protected readonly mastered = computed(() => {
    const cards = this.user.state().cards;
    return Object.values(cards).filter((c) => c.box >= 4).length;
  });

  protected exportData(): void {
    const blob = new Blob([this.user.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `developer-codex-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected async importData(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    if (!file) return;
    try {
      this.user.import(await file.text());
      this.message.set('Progress imported.');
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'Import failed.');
    }
    input.value = '';
  }

  protected reset(): void {
    if (confirm('Reset all progress, bookmarks and review history? This cannot be undone.')) {
      this.user.reset();
      this.message.set('Progress reset.');
    }
  }
}
