import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import {
  InterviewAnswer, InterviewGrade, InterviewMode, InterviewQuestion, InterviewResult,
  missCounts, pickQuestions, QuestionTypes, questionPool, scoreAnswers,
} from '../../core/interview';
import { MarkdownService } from '../../core/markdown.service';
import { Difficulty } from '../../core/models';
import { UserDataService } from '../../core/user-data.service';
import { Icon } from '../../shared/icon';

type Phase = 'setup' | 'session' | 'review' | 'results';

interface Setup {
  stacks: string[];
  difficulty: Difficulty | null;
  count: number;
  mode: InterviewMode;
  seconds: number;
  types: QuestionTypes;
}

const SETUP_KEY = 'developer-codex.interview.setup';
const DEFAULT_SETUP: Setup = { stacks: [], difficulty: null, count: 10, mode: 'practice', seconds: 120, types: 'both' };

function loadSetup(): Setup {
  try {
    return { ...DEFAULT_SETUP, ...JSON.parse(localStorage.getItem(SETUP_KEY) ?? '{}') };
  } catch {
    return DEFAULT_SETUP;
  }
}

/**
 * Interview prep: pick stacks, then answer recall-card questions in practice mode (reveal and
 * self-grade each one) or mock mode (timed, answers revealed and graded at the end).
 */
@Component({
  selector: 'app-interview-page',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './interview-page.html',
  styleUrl: './interview-page.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class InterviewPage {
  protected readonly content = inject(ContentService);
  protected readonly user = inject(UserDataService);
  private readonly markdown = inject(MarkdownService);

  protected readonly counts = [10, 20, 30, 0];
  protected readonly timers = [60, 120, 180];
  protected readonly levels: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
  protected readonly grades: { grade: InterviewGrade; label: string; key: string }[] = [
    { grade: 'nailed', label: 'Nailed it', key: '1' },
    { grade: 'partial', label: 'Partly', key: '2' },
    { grade: 'missed', label: 'Missed', key: '3' },
  ];

  // ---- setup ----
  protected readonly setup = signal<Setup>(loadSetup());
  protected readonly phase = signal<Phase>('setup');

  /** Questions available per stack at the chosen difficulty. */
  protected readonly stackCounts = computed(() => {
    const { difficulty, types } = this.setup();
    const articles = this.content.articles();
    const stacks = this.content.stacks();
    return new Map(stacks.map((s) => [s.id, questionPool(stacks, articles, [s.id], difficulty, types).length]));
  });
  protected readonly pool = computed(() =>
    questionPool(this.content.stacks(), this.content.articles(), this.setup().stacks, this.setup().difficulty, this.setup().types),
  );
  protected readonly sessionSize = computed(() => {
    const count = this.setup().count;
    return count ? Math.min(count, this.pool().length) : this.pool().length;
  });

  // ---- session ----
  protected readonly questions = signal<InterviewQuestion[]>([]);
  protected readonly answers = signal<InterviewAnswer[]>([]);
  protected readonly index = signal(0);
  protected readonly notes = signal('');
  protected readonly revealed = signal(false);
  protected readonly remaining = signal(0);
  private mode: InterviewMode = 'practice';
  private timer?: ReturnType<typeof setInterval>;

  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly reviewing = computed(() => this.answers()[this.index()]);
  protected readonly active = computed(() =>
    this.phase() === 'review' ? this.reviewing()?.question : this.current(),
  );
  protected readonly front = computed(() => {
    const q = this.active();
    return q ? this.markdown.renderInline(q.card.q) : '';
  });
  protected readonly back = computed(() => {
    const q = this.active();
    return q ? this.markdown.renderFragment(q.card.a) : '';
  });

  // ---- results ----
  protected readonly result = signal<InterviewResult | null>(null);
  protected readonly toImprove = computed(() =>
    this.answers().filter((a) => a.grade !== 'nailed'),
  );
  protected readonly addedToDeck = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  // ---- setup actions ----
  protected update(patch: Partial<Setup>): void {
    this.setup.update((s) => ({ ...s, ...patch }));
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(this.setup()));
    } catch {}
  }

  protected toggleStack(id: string): void {
    const stacks = this.setup().stacks;
    this.update({ stacks: stacks.includes(id) ? stacks.filter((s) => s !== id) : [...stacks, id] });
  }

  protected selectAll(): void {
    this.update({ stacks: this.content.stacks().filter((s) => this.stackCounts().get(s.id)).map((s) => s.id) });
  }

  protected stackTitle(id: string): string {
    return this.content.stacks().find((s) => s.id === id)?.title ?? id;
  }

  protected stackTitles(ids: string[]): string {
    return ids.map((id) => this.stackTitle(id)).join(', ');
  }

  protected inline(markdown: string): string {
    return this.markdown.renderInline(markdown);
  }

  // ---- session flow ----
  protected start(questions?: InterviewQuestion[]): void {
    const { count, mode } = this.setup();
    this.mode = mode;
    this.questions.set(questions ?? pickQuestions(this.pool(), count, missCounts(this.user.interviews())));
    this.answers.set([]);
    this.result.set(null);
    this.addedToDeck.set(false);
    this.index.set(0);
    this.phase.set('session');
    this.beginQuestion();
  }

  private beginQuestion(): void {
    this.notes.set('');
    this.revealed.set(false);
    this.stopTimer();
    if (this.mode === 'mock') {
      this.remaining.set(this.setup().seconds);
      this.timer = setInterval(() => {
        this.remaining.update((r) => r - 1);
        if (this.remaining() <= 0) this.nextMock(true);
      }, 1000);
    }
  }

  protected reveal(): void {
    this.revealed.set(true);
  }

  /** Practice mode: grade the revealed answer and move on. */
  protected grade(grade: InterviewGrade): void {
    const question = this.current();
    if (!question || !this.revealed()) return;
    this.answers.update((a) => [...a, { question, notes: this.notes(), grade }]);
    this.advance();
  }

  /** Mock mode: record notes (answers stay hidden) and move on; grading happens at the end. */
  protected nextMock(timedOut = false): void {
    const question = this.current();
    if (!question) return;
    this.answers.update((a) => [...a, { question, notes: this.notes(), timedOut }]);
    this.advance();
  }

  private advance(): void {
    if (this.index() + 1 < this.questions().length) {
      this.index.update((i) => i + 1);
      this.beginQuestion();
    } else if (this.mode === 'mock') {
      this.stopTimer();
      this.index.set(0);
      this.phase.set('review');
    } else {
      this.finish();
    }
  }

  /** Mock review: grade each answer against the model answer. */
  protected gradeReview(grade: InterviewGrade): void {
    const i = this.index();
    this.answers.update((list) => list.map((a, n) => (n === i ? { ...a, grade } : a)));
    if (i + 1 < this.answers().length) this.index.set(i + 1);
    else this.finish();
  }

  /** Ends early: answered questions are scored, unanswered ones are dropped. */
  protected endSession(): void {
    this.stopTimer();
    if (!this.answers().length) {
      this.phase.set('setup');
      return;
    }
    if (this.mode === 'mock' && this.phase() === 'session') {
      this.index.set(0);
      this.phase.set('review');
    } else {
      this.finish();
    }
  }

  private finish(): void {
    this.stopTimer();
    const answers = this.answers();
    const result: InterviewResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mode: this.mode,
      stacks: [...new Set(answers.map((a) => a.question.stackId))],
      ...scoreAnswers(answers),
    };
    this.result.set(result);
    this.user.recordInterview(result);
    this.phase.set('results');
  }

  // ---- results actions ----
  protected retryToImprove(): void {
    this.start(this.toImprove().map((a) => a.question));
  }

  protected addToDeck(): void {
    this.user.addToDeck(this.toImprove().map((a) => a.question.card.id));
    this.addedToDeck.set(true);
  }

  protected newSession(): void {
    this.phase.set('setup');
  }

  // ---- helpers ----
  protected onKey(event: KeyboardEvent): void {
    const inTextarea = (event.target as HTMLElement).tagName === 'TEXTAREA';
    const submit = event.key === 'Enter' && (event.ctrlKey || event.metaKey);
    const phase = this.phase();
    if (phase === 'session' && this.mode === 'practice') {
      if (!this.revealed() && (submit || (!inTextarea && event.key === ' '))) {
        event.preventDefault();
        this.reveal();
      } else if (this.revealed() && !inTextarea) {
        const g = this.grades.find((x) => x.key === event.key);
        if (g) this.grade(g.grade);
      }
    } else if (phase === 'session' && submit) {
      event.preventDefault();
      this.nextMock();
    } else if (phase === 'review' && !inTextarea) {
      const g = this.grades.find((x) => x.key === event.key);
      if (g) this.gradeReview(g.grade);
    }
  }

  protected formatTime(seconds: number): string {
    const s = Math.max(0, seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  protected percent(s: { asked: number; nailed: number; partial: number }): number {
    return s.asked ? Math.round(((s.nailed + s.partial / 2) / s.asked) * 100) : 0;
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
