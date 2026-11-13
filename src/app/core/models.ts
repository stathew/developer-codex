export type ContentType = 'markdown' | 'html';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Flashcard {
  id: string;
  q: string;
  a: string;
}

export interface ArticleMeta {
  slug: string;
  type: ContentType;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  difficulty?: Difficulty;
  updated: string;
  readingMinutes: number;
  order: number;
  path: string;
  related: string[];
  cards: Flashcard[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  count: number;
}

export interface Manifest {
  version: string;
  categories: Category[];
  articles: ArticleMeta[];
}

export interface SearchDoc {
  id: string;
  slug: string;
  title: string;
  heading: string;
  anchor: string;
  text: string;
  tags: string;
  summary: string;
  category: string;
  type: ContentType;
}

export interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

export interface RenderedDoc {
  html: string;
  headings: TocHeading[];
}
