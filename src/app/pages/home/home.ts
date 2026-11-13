import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { UiService } from '../../core/ui.service';
import { UserDataService } from '../../core/user-data.service';
import { ArticleList } from '../../shared/article-list';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, ArticleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  protected readonly ui = inject(UiService);

  protected readonly recent = computed(() => this.user.recent().slice(0, 4));
  protected readonly progress = computed(() => {
    const total = this.content.articles().length;
    return total ? Math.round((this.user.studiedCount() / total) * 100) : 0;
  });
  protected readonly suggestions = ['big o', 'signals', 'idempotent', 'jwt', 'index', 'code review'];

  protected studiedIn(id: string): number {
    return this.content.inCategory(id).filter((a) => this.user.isStudied(a.slug)).length;
  }
}
