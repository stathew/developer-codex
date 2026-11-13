import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** 24×24 stroke icons. Category icons in categories.json refer to these names. */
const ICONS: Record<string, string> = {
  book: 'M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h13M8 7h7',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35',
  target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M18 6 6 18M6 6l12 12',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z',
  bookmark: 'M6 3h12v18l-6-4-6 4Z',
  check: 'M20 6 9 17l-5-5',
  'check-circle': 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  brain:
    'M9.5 2A2.5 2.5 0 0 0 7 4.5v.1A3 3 0 0 0 4.6 9a3 3 0 0 0 .4 5.2A3 3 0 0 0 9 18.9V19a3 3 0 0 0 3 3V4.5A2.5 2.5 0 0 0 9.5 2Zm5 0A2.5 2.5 0 0 1 17 4.5v.1A3 3 0 0 1 19.4 9a3 3 0 0 1-.4 5.2 3 3 0 0 1-4 4.7V19a3 3 0 0 1-3 3',
  layers: 'm12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  server: 'M3 4h18v6H3Zm0 10h18v6H3Zm4-7h.01M7 17h.01',
  database: 'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3Zm9 3v12c0 1.66-4.03 3-9 3s-9-1.34-9-3V6m18 6c0 1.66-4.03 3-9 3s-9-1.34-9-3',
  cloud: 'M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 1 0 6 17.5 4 4 0 0 0 7 19Z',
  sparkles: 'M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9ZM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6Z',
  compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.24 5.76-2.12 6.36-6.36 2.12 2.12-6.36Z',
  pen: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  play: 'M6 4l14 8-14 8Z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5v5l3 3',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  'arrow-left': 'M19 12H5m6 6-6-6 6-6',
  library: 'M4 4v16M9 4v16M14 4l5 16M2 20h20',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  git: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-12a9 9 0 0 1-9 9',
  hash: 'M4 9h16M4 15h16M10 3 8 21M16 3l-2 18',
  external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  download: 'M12 3v12m-5-5 5 5 5-5M5 21h14',
  upload: 'M12 21V9m-5 5 5-5 5 5M5 3h14',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="path()" /></svg>`,
  styles: `:host { display: inline-flex; flex-shrink: 0; line-height: 0; }`,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(18);
  protected readonly path = computed(() => ICONS[this.name()] ?? ICONS['book']);
}
