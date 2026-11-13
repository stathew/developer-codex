import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ContentService } from '../core/content.service';
import { UiService } from '../core/ui.service';
import { UserDataService } from '../core/user-data.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.open]': 'ui.sidebarOpen()' },
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  protected readonly ui = inject(UiService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Category the current route belongs to — always expanded. */
  private readonly activeCategory = computed(() => {
    const url = decodeURIComponent(this.url().split(/[?#]/)[0]);
    if (url.startsWith('/c/')) return url.slice(3);
    if (url.startsWith('/a/')) return this.content.article(url.slice(3))?.category ?? '';
    return '';
  });

  private readonly toggled = signal<Record<string, boolean>>({});

  protected isExpanded(id: string): boolean {
    return this.toggled()[id] ?? id === this.activeCategory();
  }

  protected toggle(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggled.update((t) => ({ ...t, [id]: !this.isExpanded(id) }));
  }

  protected studiedIn(id: string): number {
    return this.content.inCategory(id).filter((a) => this.user.isStudied(a.slug)).length;
  }

  protected close(): void {
    this.ui.sidebarOpen.set(false);
  }
}
