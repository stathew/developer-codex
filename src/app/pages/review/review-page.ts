import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { MarkdownService } from '../../core/markdown.service';
import { Flashcard } from '../../core/models';
import { Grade, UserDataService } from '../../core/user-data.service';
import { Icon } from '../../shared/icon';

type Mode = 'due' | 'practice';

const GRADES: { grade: Grade; label: string; hint: string }[] = [
  { grade: 'again', label: 'Again', hint: 'Forgot — show again this session' },
  { grade: 'hard', label: 'Hard', hint: 'Recalled with effort — tomorrow' },
  { grade: 'good', label: 'Good', hint: 'Recalled — next interval' },
  { grade: 'easy', label: 'Easy', hint: 'Instant — skip ahead' },
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Component({
  selector: 'app-review-page',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './review-page.html',
  styleUrl: './review-page.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class ReviewPage {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  private readonly markdown = inject(MarkdownService);

  protected readonly grades = GRADES;
  protected readonly mode = signal<Mode>('due');
  protected readonly practiceCategory = signal('');
  protected readonly queue = signal<Flashcard[]>([]);
  protected readonly index = signal(0);
  protected readonly revealed = signal(false);
  protected readonly running = signal(false);
  protected readonly tally = signal<Record<Grade, number>>({ again: 0, hard: 0, good: 0, easy: 0 });

  protected readonly current = computed(() => this.queue()[this.index()]);
  protected readonly finished = computed(() => this.running() && !this.current());
  protected readonly reviewed = computed(() => Object.values(this.tally()).reduce((a, b) => a + b, 0));
  protected readonly source = computed(() => {
    const card = this.current();
    return card ? this.content.article(card.id.split('::')[0]) : undefined;
  });
  protected readonly front = computed(() => (this.current() ? this.markdown.renderInline(this.current()!.q) : ''));
  protected readonly back = computed(() => (this.current() ? this.markdown.renderFragment(this.current()!.a) : ''));

  protected readonly practicePool = computed(() => {
    const cat = this.practiceCategory();
    return this.content.articles().filter((a) => !cat || a.category === cat).flatMap((a) => a.cards);
  });

  /** Entries with cards that aren't in the deck yet — suggestions for what to study next. */
  protected readonly unstudiedWithCards = computed(() =>
    this.content.articles().filter((a) => a.cards.length && !this.user.isStudied(a.slug)).slice(0, 6),
  );

  protected start(mode: Mode): void {
    const cards = mode === 'due' ? this.user.dueCards() : this.practicePool();
    if (!cards.length) return;
    this.mode.set(mode);
    this.queue.set(shuffle(cards));
    this.index.set(0);
    this.revealed.set(false);
    this.tally.set({ again: 0, hard: 0, good: 0, easy: 0 });
    this.running.set(true);
  }

  protected stop(): void {
    this.running.set(false);
    this.queue.set([]);
  }

  protected reveal(): void {
    this.revealed.set(true);
  }

  protected grade(grade: Grade): void {
    const card = this.current();
    if (!card || !this.revealed()) return;
    // Practice mode is for cramming — it never touches the schedule.
    if (this.mode() === 'due') this.user.grade(card, grade);
    this.tally.update((t) => ({ ...t, [grade]: t[grade] + 1 }));
    if (grade === 'again') this.queue.update((q) => [...q, card]);
    this.index.update((i) => i + 1);
    this.revealed.set(false);
  }

  protected onKey(event: KeyboardEvent): void {
    if (!this.running() || !this.current() || /^(INPUT|SELECT|TEXTAREA)$/.test((event.target as HTMLElement).tagName)) return;
    if ((event.key === ' ' || event.key === 'Enter') && !this.revealed()) {
      event.preventDefault();
      this.reveal();
    } else if (this.revealed() && ['1', '2', '3', '4'].includes(event.key)) {
      this.grade(GRADES[Number(event.key) - 1].grade);
    }
  }

  protected box(card: Flashcard): number {
    return this.user.cardState(card.id)?.box ?? 0;
  }
}
