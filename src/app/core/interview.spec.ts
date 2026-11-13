import { InterviewAnswer, InterviewQuestion, InterviewResult, missCounts, pickQuestions, questionPool, scoreAnswers, stackMatches } from './interview';
import { ArticleMeta, InterviewStack } from './models';

function article(slug: string, tags: string[], cards: number, extra: Partial<ArticleMeta> = {}): ArticleMeta {
  return {
    slug,
    type: 'markdown',
    title: slug,
    summary: '',
    category: slug.split('/')[0],
    tags,
    updated: '2026-11-13',
    readingMinutes: 1,
    order: 1,
    path: `content/${slug}.md`,
    related: [],
    cards: Array.from({ length: cards }, (_, i) => ({ id: `${slug}::${i}`, q: `Q${i}`, a: `A${i}` })),
    ...extra,
  };
}

const STACKS: InterviewStack[] = [
  { id: 'angular', title: 'Angular', tags: ['angular'] },
  { id: 'frontend', title: 'Frontend', categories: ['frontend'] },
  { id: 'behavioural', title: 'Behavioural', slugs: ['career/stories'] },
];

const ARTICLES = [
  article('frontend/angular', ['angular', 'typescript'], 3, { difficulty: 'intermediate' }),
  article('frontend/react', ['react'], 2, {
    difficulty: 'beginner',
    interviewCards: [{ id: 'frontend/react::iq-1', q: 'Design?', a: 'So.' }],
  }),
  article('backend/spring', ['java'], 4),
  article('career/stories', ['interviews'], 1),
];

describe('interview', () => {
  describe('stackMatches', () => {
    it('matches by tag, category or slug', () => {
      expect(stackMatches(STACKS[0], ARTICLES[0])).toBe(true);
      expect(stackMatches(STACKS[0], ARTICLES[1])).toBe(false);
      expect(stackMatches(STACKS[1], ARTICLES[1])).toBe(true);
      expect(stackMatches(STACKS[2], ARTICLES[3])).toBe(true);
    });
  });

  describe('questionPool', () => {
    it('includes interview questions, and can filter by question type', () => {
    const both = questionPool(STACKS, ARTICLES, ['frontend']);
    expect(both.length).toBe(6);
    expect(both.find((q) => q.card.id === 'frontend/react::iq-1')?.kind).toBe('interview');
    expect(questionPool(STACKS, ARTICLES, ['frontend'], null, 'interview').map((q) => q.card.id)).toEqual(['frontend/react::iq-1']);
    expect(questionPool(STACKS, ARTICLES, ['frontend'], null, 'recall').every((q) => q.kind === 'recall')).toBe(true);
  });

  it('collects cards from matching entries only', () => {
      const pool = questionPool(STACKS, ARTICLES, ['frontend']);
      expect(pool.map((q) => q.card.id)).toEqual([
        'frontend/angular::0', 'frontend/angular::1', 'frontend/angular::2',
        'frontend/react::iq-1', 'frontend/react::0', 'frontend/react::1',
      ]);
    });

    it('includes each card once, attributed to the first selected stack that matches', () => {
      const pool = questionPool(STACKS, ARTICLES, ['angular', 'frontend']);
      expect(pool.length).toBe(6);
      expect(pool.filter((q) => q.stackId === 'angular').length).toBe(3);
      expect(pool.filter((q) => q.stackId === 'frontend').length).toBe(3);
    });

    it('filters by difficulty but keeps entries without a level', () => {
      expect(questionPool(STACKS, ARTICLES, ['frontend'], 'beginner').map((q) => q.article.slug)).toEqual([
        'frontend/react', 'frontend/react', 'frontend/react',
      ]);
      expect(questionPool(STACKS, ARTICLES, ['behavioural'], 'advanced').length).toBe(1);
    });

    it('ignores unknown stack ids and returns nothing when none are selected', () => {
      expect(questionPool(STACKS, ARTICLES, ['nope'])).toEqual([]);
      expect(questionPool(STACKS, ARTICLES, [])).toEqual([]);
    });
  });

  describe('pickQuestions', () => {
    const pool = questionPool(STACKS, ARTICLES, ['frontend']);

    it('returns the requested number of distinct questions, or all for 0', () => {
      const picked = pickQuestions(pool, 3);
      expect(picked.length).toBe(3);
      expect(new Set(picked.map((q) => q.card.id)).size).toBe(3);
      expect(pickQuestions(pool, 0).length).toBe(pool.length);
      expect(pickQuestions(pool, 99).length).toBe(pool.length);
    });

    it('favours questions missed in earlier sessions', () => {
      let seeded = 1;
      const random = () => ((seeded = (seeded * 16807) % 2147483647) / 2147483647); // deterministic
      const missed = 'frontend/react::1';
      let hits = 0;
      for (let run = 0; run < 400; run++) {
        if (pickQuestions(pool, 1, { [missed]: 3 }, random)[0].card.id === missed) hits++;
      }
      // Weight 7 vs 1 for the other five cards → expected share 7/12 ≈ 58%; uniform would be ~17%.
      expect(hits / 400).toBeGreaterThan(0.5);
    });
  });

  describe('scoreAnswers', () => {
    const q = (id: string, stackId: string): InterviewQuestion =>
      ({ card: { id, q: '', a: '' }, article: ARTICLES[0], stackId }) as InterviewQuestion;

    it('scores nailed as 1, partial as ½ and missed or ungraded as 0, per stack', () => {
      const answers: InterviewAnswer[] = [
        { question: q('a', 'angular'), notes: '', grade: 'nailed' },
        { question: q('b', 'angular'), notes: '', grade: 'partial' },
        { question: q('c', 'frontend'), notes: '', grade: 'missed' },
        { question: q('d', 'frontend'), notes: '', timedOut: true },
      ];
      expect(scoreAnswers(answers)).toEqual({
        asked: 4,
        score: 38, // 1.5 / 4
        perStack: {
          angular: { asked: 2, nailed: 1, partial: 1, missed: 0 },
          frontend: { asked: 2, nailed: 0, partial: 0, missed: 2 },
        },
        missed: ['b', 'c', 'd'],
      });
    });

    it('handles an empty session', () => {
      expect(scoreAnswers([]).score).toBe(0);
    });
  });

  it('missCounts tallies misses across sessions', () => {
    const history = [{ missed: ['a', 'b'] }, { missed: ['a'] }] as InterviewResult[];
    expect(missCounts(history)).toEqual({ a: 2, b: 1 });
  });
});
