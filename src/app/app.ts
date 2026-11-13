import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './core/theme.service';
import { UiService } from './core/ui.service';
import { SearchPalette } from './layout/search-palette';
import { Sidebar } from './layout/sidebar';
import { Icon } from './shared/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Sidebar, SearchPalette, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class App {
  protected readonly ui = inject(UiService);
  protected readonly theme = inject(ThemeService);
  protected readonly isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  constructor() {
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.ui.sidebarOpen.set(false));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.ui.paletteOpen()) this.ui.paletteOpen.set(false);
      else this.ui.openPalette();
    } else if (event.key === '/' && !typing && !this.ui.paletteOpen()) {
      event.preventDefault();
      this.ui.openPalette();
    }
  }
}
