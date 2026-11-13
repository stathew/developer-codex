import {
  ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, input, resource, signal, untracked, viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { MarkdownService } from '../../core/markdown.service';
import { stripFrontMatter } from '../../core/text';
import { ThemeService } from '../../core/theme.service';
import { UserDataService } from '../../core/user-data.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-page.html',
  styleUrl: './article-page.scss',
  host: {
    '(window:scroll)': 'updateActiveHeading()',
    '(window:message)': 'onFrameMessage($event)',
  },
})
export class ArticlePage {
  readonly slug = input.required<string>();

  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  private readonly markdown = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  protected readonly meta = computed(() => this.content.article(this.slug()));
  protected readonly category = computed(() => this.content.category(this.meta()?.category ?? ''));
  protected readonly related = computed(() =>
    (this.meta()?.related ?? []).map((s) => this.content.article(s)).filter((a) => !!a),
  );
  protected readonly neighbours = computed(() => this.content.neighbours(this.slug()));

  protected readonly doc = resource({
    params: () => {
      const meta = this.meta();
      return meta?.type === 'markdown' ? meta : undefined;
    },
    loader: async ({ params }) =>
      this.markdown.render(stripFrontMatter(await this.content.source(params)), params.slug),
  });

  protected readonly html = computed(() =>
    this.doc.hasValue() ? this.sanitizer.bypassSecurityTrustHtml(this.doc.value().html) : null,
  );
  protected readonly headings = computed(() => (this.doc.hasValue() ? this.doc.value().headings : []));
  protected readonly activeHeading = signal('');

  /** Interactive (HTML) entries render in a sandboxed iframe. Theme is read untracked so toggling doesn't reload it. */
  protected readonly frameUrl = computed(() => {
    const meta = this.meta();
    if (meta?.type !== 'html') return null;
    const theme = untracked(this.theme.theme);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${meta.path}?theme=${theme}&v=${this.content.manifest().version}`);
  });
  protected readonly frameHeight = signal(640);

  constructor() {
    const title = inject(Title);
    effect(() => {
      const meta = this.meta();
      title.setTitle(meta ? `${meta.title} · Developer Codex` : 'Not found · Developer Codex');
      if (meta) untracked(() => this.user.visit(meta.slug));
    });

    // Scroll to the URL fragment once the content is in the DOM.
    effect(() => {
      const fragment = this.fragment();
      if (!this.html() || !fragment) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.getElementById(fragment)?.scrollIntoView({ block: 'start' })),
      );
    });

    effect(() => {
      this.html();
      requestAnimationFrame(() => this.updateActiveHeading());
    });

    inject(DestroyRef).onDestroy(() => this.copyTimers.forEach(clearTimeout));
  }

  private readonly copyTimers = new Set<ReturnType<typeof setTimeout>>();

  protected onBodyClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const copy = target.closest<HTMLElement>('[data-copy]');
    if (copy) {
      const code = copy.closest('.code-block')?.querySelector('code')?.textContent ?? '';
      navigator.clipboard?.writeText(code).then(() => {
        copy.textContent = 'Copied';
        const t = setTimeout(() => (copy.textContent = 'Copy'), 1500);
        this.copyTimers.add(t);
      });
      return;
    }

    const link = target.closest('a');
    if (!link || link.target === '_blank' || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith('#')) {
      event.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(history.state, '', `${location.pathname}${href}`);
    } else if (href.startsWith('/')) {
      event.preventDefault();
      this.router.navigateByUrl(href);
    }
  }

  protected scrollTo(id: string, event: Event): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(history.state, '', `${location.pathname}#${id}`);
  }

  protected updateActiveHeading(): void {
    const container = this.body()?.nativeElement;
    if (!container) return;
    let active = '';
    for (const h of container.querySelectorAll<HTMLElement>('h2[id], h3[id]')) {
      if (h.getBoundingClientRect().top > 120) break;
      active = h.id;
    }
    if (active !== this.activeHeading()) this.activeHeading.set(active);
  }

  protected onFrameMessage(event: MessageEvent): void {
    const frame = this.frame()?.nativeElement;
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'codex:height' && typeof event.data.height === 'number') {
      this.frameHeight.set(Math.max(320, Math.ceil(event.data.height)));
    }
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
