import { ArticleMeta, Difficulty, Flashcard, InterviewStack } from './models';

export type InterviewMode = 'practice' | 'mock';
/** Which questions to draw: open-ended interview questions, recall cards, or both. */
export type QuestionTypes = 'both' | 'interview' | 'recall';
export type InterviewGrade = 'nailed' | 'partial' | 'missed';

export interface InterviewQuestion {
  card: Flashcard;
  article: ArticleMeta;
  /** The selected stack this question was drawn for (the first matching one). */
  stackId: string;
  kind: 'recall' | 'interview';
}

export interface InterviewAnswer {
  question: InterviewQuestion;
  notes: string;
  grade?: InterviewGrade;
  timedOut?: boolean;
}

export interface StackScore {
  asked: number;
  nailed: number;
  partial: number;
  missed: number;
}

export interface InterviewResult {
  id: string;
  date: string;
  mode: InterviewMode;
  stacks: string[];
  asked: number;
  /** 0–100: nailed = 1 point, partial = ½, missed or ungraded = 0. */
  score: number;
  perStack: Record<string, StackScore>;
  /** Card ids answered "missed" or "partial", for weighting future sessions and retries. */
  missed: string[];
}

const POINTS: Record<InterviewGrade, number> = { nailed: 1, partial: 0.5, missed: 0 };

/** True when an entry belongs to a stack. Mirrors stackMatches in scripts/build-content.mjs. */
export function stackMatches(stack: InterviewStack, article: ArticleMeta): boolean {
  return (
    (stack.categories ?? []).includes(article.category) ||
    (stack.tags ?? []).some((t) => article.tags.includes(t)) ||
    (stack.slugs ?? []).includes(article.slug)
  );
}

/**
 * All questions available for the selected stacks. Each card appears once, attributed to the first
 * selected stack it matches. A difficulty filter excludes entries marked with a different level.
 */
export function questionPool(
  stacks: InterviewStack[],
  articles: ArticleMeta[],
  selectedIds: string[],
  difficulty: Difficulty | null = null,
  types: QuestionTypes = 'both',
): InterviewQuestion[] {
  const selected = selectedIds.map((id) => stacks.find((s) => s.id === id)).filter((s) => !!s);
  const pool: InterviewQuestion[] = [];
  for (const article of articles) {
    if (difficulty && article.difficulty && article.difficulty !== difficulty) continue;
    const stack = selected.find((s) => stackMatches(s, article));
    if (!stack) continue;
    if (types !== 'recall') {
      for (const card of article.interviewCards ?? []) pool.push({ card, article, stackId: stack.id, kind: 'interview' });
    }
    if (types !== 'interview') {
      for (const card of article.cards) pool.push({ card, article, stackId: stack.id, kind: 'recall' });
    }
  }
  return pool;
}

/** How often each card was missed or only partly answered across past sessions. */
export function missCounts(history: InterviewResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const result of history) for (const id of result.missed) counts[id] = (counts[id] ?? 0) + 1;
  return counts;
}

/**
 * Picks `count` questions (0 = all) at random without replacement, weighting cards you've
 * struggled with before so they come up more often (weighted reservoir sampling, Efraimidis–Spirakis).
 */
export function pickQuestions(
  pool: InterviewQuestion[],
  count: number,
  misses: Record<string, number> = {},
  random: () => number = Math.random,
): InterviewQuestion[] {
  const take = count > 0 ? Math.min(count, pool.length) : pool.length;
  return pool
    .map((q) => {
      const weight = 1 + 2 * Math.min(misses[q.card.id] ?? 0, 3);
      return { q, key: Math.pow(random(), 1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .slice(0, take)
    .map((x) => x.q);
}

export function scoreAnswers(
  answers: InterviewAnswer[],
): Pick<InterviewResult, 'asked' | 'score' | 'perStack' | 'missed'> {
  const perStack: Record<string, StackScore> = {};
  let points = 0;
  const missed: string[] = [];
  for (const answer of answers) {
    const grade = answer.grade ?? 'missed';
    const s = (perStack[answer.question.stackId] ??= { asked: 0, nailed: 0, partial: 0, missed: 0 });
    s.asked++;
    s[grade]++;
    points += POINTS[grade];
    if (grade !== 'nailed') missed.push(answer.question.card.id);
  }
  return {
    asked: answers.length,
    score: answers.length ? Math.round((points / answers.length) * 100) : 0,
    perStack,
    missed,
  };
}
