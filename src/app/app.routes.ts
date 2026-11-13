import { Routes, UrlSegment } from '@angular/router';

/** Matches /a/<any/nested/slug> and exposes the full slug as the `slug` input. */
export function articleMatcher(segments: UrlSegment[]) {
  if (segments.length < 2 || segments[0].path !== 'a') return null;
  const slug = segments.slice(1).map((s) => s.path).join('/');
  return { consumed: segments, posParams: { slug: new UrlSegment(slug, {}) } };
}

export const routes: Routes = [
  { path: '', title: 'Developer Codex', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { matcher: articleMatcher, loadComponent: () => import('./pages/article/article-page').then((m) => m.ArticlePage) },
  { path: 'c/:id', loadComponent: () => import('./pages/category/category-page').then((m) => m.CategoryPage) },
  { path: 'search', title: 'Explore · Developer Codex', loadComponent: () => import('./pages/search/search-page').then((m) => m.SearchPage) },
  { path: 'review', title: 'Review · Developer Codex', loadComponent: () => import('./pages/review/review-page').then((m) => m.ReviewPage) },
  { path: 'library', title: 'My library · Developer Codex', loadComponent: () => import('./pages/library/library-page').then((m) => m.LibraryPage) },
  { path: '**', title: 'Not found · Developer Codex', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound) },
];
