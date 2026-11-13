import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';
import { ArticleMeta } from './models';
import { UserDataService } from './user-data.service';

const STORAGE_KEY = 'developer-codex.user.v1';
const NOW = new Date('2026-11-13T10:00:00');

function article(slug: string, cardCount: number): ArticleMeta {
  return {
    slug,
    type: 'markdown',
    title: slug,
    summary: '',
    category: slug.split('/')[0],
    tags: [],
    updated: '2026-11-13',
    readingMinutes: 1,
    order: 1,
    path: `content/${slug}.md`,
    related: [],
    cards: Array.from({ length: cardCount }, (_, i) => ({ id: `${slug}::${i}`, q: `Q${i}`, a: `A${i}` })),
  };
}

/** Midnight `days` after NOW, as the scheduler stores due dates. */
function dueIn(days: number): string {
  const d = new Date(NOW);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

describe('UserDataService', () => {
  let user: UserDataService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(ContentService).manifest.set({
      version: 'test',
      categories: [],
      articles: [article('backend/rest', 2), article('design/solid', 1)],
    });
    user = TestBed.inject(UserDataService);
  });

  afterEach(() => vi.useRealTimers());

  describe('review deck', () => {
    it('is empty until an entry is marked as studied', () => {
      expect(user.deck()).toEqual([]);
      user.toggleStudied('backend/rest');
      expect(user.deck().map((c) => c.id)).toEqual(['backend/rest::0', 'backend/rest::1']);
      expect(user.dueCards().length).toBe(2);
    });

    it('drops cards again when an entry is un-studied', () => {
      user.toggleStudied('backend/rest');
      user.toggleStudied('backend/rest');
      expect(user.deck()).toEqual([]);
      expect(user.isStudied('backend/rest')).toBe(false);
    });
  });

  describe('spaced-repetition grading', () => {
    const card = () => user.deck()[0];
    beforeEach(() => user.toggleStudied('backend/rest'));

    it('"good" on a new card moves it to box 1, due tomorrow, and out of the due list', () => {
      user.grade(card(), 'good');
      expect(user.cardState('backend/rest::0')).toEqual({ box: 1, due: dueIn(1), reviews: 1, lapses: 0 });
      expect(user.dueCards().map((c) => c.id)).toEqual(['backend/rest::1']);
    });

    it('follows the Leitner intervals as a card keeps being recalled', () => {
      const expected = [
        [1, 1],
        [2, 3],
        [3, 7],
        [4, 16],
        [5, 35],
        [6, 90],
        [6, 90], // capped at the top box
      ];
      for (const [box, days] of expected) {
        user.grade(card(), 'good');
        expect(user.cardState('backend/rest::0')).toMatchObject({ box, due: dueIn(days) });
      }
    });

    it('"easy" skips a box', () => {
      user.grade(card(), 'easy');
      expect(user.cardState('backend/rest::0')).toMatchObject({ box: 2, due: dueIn(3) });
    });

    it('"hard" keeps the box (minimum 1) and schedules tomorrow', () => {
      user.grade(card(), 'good');
      user.grade(card(), 'good');
      user.grade(card(), 'hard');
      expect(user.cardState('backend/rest::0')).toMatchObject({ box: 2, due: dueIn(1) });
    });

    it('"again" resets to box 1, counts a lapse and keeps the card due now', () => {
      user.grade(card(), 'easy');
      user.grade(card(), 'again');
      expect(user.cardState('backend/rest::0')).toEqual({ box: 1, due: NOW.toISOString(), reviews: 2, lapses: 1 });
      expect(user.dueCards().some((c) => c.id === 'backend/rest::0')).toBe(true);
    });

    it('cards become due again once their date passes', () => {
      user.grade(card(), 'good');
      vi.setSystemTime(new Date('2026-11-14T09:00:00'));
      user.visit('design/solid'); // any state change re-evaluates the due list
      expect(user.dueCards().some((c) => c.id === 'backend/rest::0')).toBe(true);
    });
  });

  describe('interview prep integration', () => {
    it('adds individual cards to the deck without studying the whole entry', () => {
      user.addToDeck(['design/solid::0', 'design/solid::0', 'unknown::9']);
      expect(user.deck().map((c) => c.id)).toEqual(['design/solid::0']);
      expect(user.isStudied('design/solid')).toBe(false);
      expect(user.dueCards().map((c) => c.id)).toEqual(['design/solid::0']);
    });

    it('does not duplicate cards that are already in the deck, and makes them due now', () => {
      user.toggleStudied('backend/rest');
      user.grade(user.deck()[0], 'good');
      user.addToDeck(['backend/rest::0']);
      expect(user.deck().length).toBe(2);
      expect(user.dueCards().map((c) => c.id)).toContain('backend/rest::0');
    });

    it('records interview results newest first, keeping the last 50', () => {
      for (let i = 0; i < 55; i++) {
        user.recordInterview({ id: String(i), date: '', mode: 'practice', stacks: [], asked: 1, score: i, perStack: {}, missed: [] });
      }
      expect(user.interviews().length).toBe(50);
      expect(user.interviews()[0].id).toBe('54');
    });

    it('loads older saved state that has no interview fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: {}, studied: {}, bookmarks: ['x'], cards: {} }));
      user.import(localStorage.getItem(STORAGE_KEY)!.replace('{', '{"app":"developer-codex","state":{').concat('}'));
      expect(user.interviews()).toEqual([]);
      expect(user.deck()).toEqual([]);
    });
  });

  describe('bookmarks and history', () => {
    it('toggles bookmarks, newest first', () => {
      user.toggleBookmark('backend/rest');
      user.toggleBookmark('design/solid');
      expect(user.bookmarks()).toEqual(['design/solid', 'backend/rest']);
      user.toggleBookmark('backend/rest');
      expect(user.bookmarks()).toEqual(['design/solid']);
    });

    it('lists recently visited entries, most recent first, skipping unknown slugs', () => {
      user.visit('backend/rest');
      vi.setSystemTime(new Date(NOW.getTime() + 60_000));
      user.visit('design/solid');
      user.visit('removed/entry');
      expect(user.recent().map((a) => a.slug)).toEqual(['design/solid', 'backend/rest']);
    });
  });

  describe('persistence', () => {
    it('saves state to localStorage', () => {
      user.toggleBookmark('backend/rest');
      TestBed.tick();
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).bookmarks).toEqual(['backend/rest']);
    });

    it('round-trips through export and import', () => {
      user.toggleStudied('design/solid');
      user.grade(user.deck()[0], 'good');
      const backup = user.export();
      user.reset();
      expect(user.studiedCount()).toBe(0);
      user.import(backup);
      expect(user.isStudied('design/solid')).toBe(true);
      expect(user.cardState('design/solid::0')?.box).toBe(1);
    });

    it('rejects files that are not Codex backups', () => {
      expect(() => user.import('{"hello": "world"}')).toThrow(/Developer Codex backup/);
      expect(() => user.import('not json')).toThrow();
    });
  });
});
