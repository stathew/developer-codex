import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly paletteOpen = signal(false);
  readonly paletteQuery = signal('');
  readonly sidebarOpen = signal(false);

  openPalette(query = ''): void {
    this.paletteQuery.set(query);
    this.paletteOpen.set(true);
  }
}
