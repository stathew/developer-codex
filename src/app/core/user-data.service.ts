import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ContentService } from './content.service';
import { Flashcard } from './models';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  box: number;
  due: string;
  reviews: number;
  lapses: number;
}

export interface UserState {
  visits: Record<string, string>;
  studied: Record<string, string>;
  bookmarks: string[];
  cards: Record<string, CardState>;
}

const STORAGE_KEY = 'developer-codex.user.v1';
/** Leitner intervals in days, indexed by box (1-6). */
const INTERVALS = [0, 1, 3, 7, 16, 35, 90];
const MAX_BOX = INTERVALS.length - 1;
const EMPTY: UserState = { visits: {}, studied: {}, bookmarks: [], cards: {} };

function load(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}

function addDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Personal learning state stored in the browser: reading history, studied entries,
 * bookmarks and the spaced-repetition (Leitner) schedule for recall cards.
 */
@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly content = inject(ContentService);
  readonly state = signal<UserState>(load());

  readonly bookmarks = computed(() => this.state().bookmarks);
  readonly studiedCount = computed(() => Object.keys(this.state().studied).length);

  readonly recent = computed(() =>
    Object.entries(this.state().visits)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([slug]) => this.content.article(slug))
      .filter((a) => !!a),
  );

  /** Cards belonging to studied entries — the scheduled review deck. */
  readonly deck = computed<Flashcard[]>(() =>
    Object.keys(this.state().studied).flatMap((slug) => this.content.article(slug)?.cards ?? []),
  );

  readonly dueCards = computed(() => {
    const now = new Date().toISOString();
    const cards = this.state().cards;
    return this.deck().filter((c) => !cards[c.id] || cards[c.id].due <= now);
  });

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      } catch {
        /* storage unavailable (private mode / quota) — state lives in memory only */
      }
    });
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) this.state.set(load());
    });
  }

  visit(slug: string): void {
    this.state.update((s) => ({ ...s, visits: { ...s.visits, [slug]: new Date().toISOString() } }));
  }

  isStudied(slug: string): boolean {
    return slug in this.state().studied;
  }

  toggleStudied(slug: string): void {
    this.state.update((s) => {
      const studied = { ...s.studied };
      if (slug in studied) delete studied[slug];
      else studied[slug] = new Date().toISOString();
      return { ...s, studied };
    });
  }

  isBookmarked(slug: string): boolean {
    return this.state().bookmarks.includes(slug);
  }

  toggleBookmark(slug: string): void {
    this.state.update((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(slug) ? s.bookmarks.filter((b) => b !== slug) : [slug, ...s.bookmarks],
    }));
  }

  cardState(id: string): CardState | undefined {
    return this.state().cards[id];
  }

  grade(card: Flashcard, grade: Grade): void {
    this.state.update((s) => {
      const prev = s.cards[card.id] ?? { box: 0, due: '', reviews: 0, lapses: 0 };
      let box = prev.box;
      let lapses = prev.lapses;
      if (grade === 'again') {
        box = 1;
        lapses++;
      } else if (grade === 'hard') box = Math.max(1, box);
      else if (grade === 'good') box = Math.min(MAX_BOX, box + 1);
      else box = Math.min(MAX_BOX, box + 2);
      const days = grade === 'again' ? 0 : grade === 'hard' ? 1 : INTERVALS[box];
      const due = grade === 'again' ? new Date().toISOString() : addDays(days);
      return { ...s, cards: { ...s.cards, [card.id]: { box, due, reviews: prev.reviews + 1, lapses } } };
    });
  }

  export(): string {
    return JSON.stringify({ app: 'developer-codex', exported: new Date().toISOString(), state: this.state() }, null, 2);
  }

  import(json: string): void {
    const parsed = JSON.parse(json);
    const state = parsed?.state ?? parsed;
    if (typeof state !== 'object' || !state || !('cards' in state)) throw new Error('Not a Developer Codex backup file.');
    this.state.set({ ...EMPTY, ...state });
  }

  reset(): void {
    this.state.set(structuredClone(EMPTY));
  }
}
