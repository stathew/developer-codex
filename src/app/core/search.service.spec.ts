import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';
import { ArticleMeta, SearchDoc } from './models';
import { SearchService } from './search.service';

function article(slug: string, extra: Partial<ArticleMeta> = {}): ArticleMeta {
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
    cards: [],
    ...extra,
  };
}

function doc(slug: string, i: number, heading: string, text: string, extra: Partial<SearchDoc> = {}): SearchDoc {
  return {
    id: `${slug}#${i}`,
    slug,
    title: slug === 'backend/rest' ? 'REST API Design' : 'Database Indexes',
    heading,
    anchor: heading.toLowerCase().replace(/\s+/g, '-'),
    text,
    tags: '',
    summary: '',
    category: slug.split('/')[0],
    type: 'markdown',
    ...extra,
  };
}

const DOCS: SearchDoc[] = [
  doc('backend/rest', 0, '', 'A good API is predictable.'),
  doc('backend/rest', 1, 'Idempotency keys', 'Make POST safe to retry: an idempotent operation has the same effect when repeated.'),
  doc('backend/rest', 2, 'Status codes', 'Never return 200 with an error body. Use 409 Conflict for <conflicts>.'),
  doc('databases/indexes', 0, '', 'Indexes turn full table scans into fast lookups.'),
  doc('databases/indexes', 1, 'Composite indexes', 'Order columns: equality filters first, then range.'),
];

describe('SearchService', () => {
  let search: SearchService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(ContentService).manifest.set({
      version: 'v1',
      categories: [],
      articles: [article('backend/rest', { tags: ['api'], difficulty: 'intermediate' }), article('databases/indexes')],
    });
    search = TestBed.inject(SearchService);

    const loaded = search.ensureLoaded();
    await vi.waitFor(() => TestBed.inject(HttpTestingController).expectOne('content/search-index.json?v=v1').flush({ docs: DOCS }));
    await loaded;
  });

  it('reports ready once the index is loaded, and loads it only once', async () => {
    expect(search.ready()).toBe(true);
    await search.ensureLoaded();
    TestBed.inject(HttpTestingController).verify(); // no second request
  });

  it('groups section hits by entry, best section first, with heading anchors', () => {
    const [group] = search.search('idempotent');
    expect(group.article.slug).toBe('backend/rest');
    expect(group.sections[0]).toMatchObject({ heading: 'Idempotency keys', anchor: 'idempotency-keys' });
  });

  it('tolerates typos and matches prefixes', () => {
    expect(search.search('idempotnt')[0]?.article.slug).toBe('backend/rest');
    expect(search.search('compos')[0]?.article.slug).toBe('databases/indexes');
  });

  it('falls back to OR when not every word matches', () => {
    expect(search.search('indexes zebra').map((g) => g.article.slug)).toEqual(['databases/indexes']);
  });

  it('applies filters from the article metadata', () => {
    const both = search.search('predictable lookups');
    expect(both.length).toBe(2);
    expect(search.search('predictable lookups', { category: 'databases' }).map((g) => g.article.slug)).toEqual(['databases/indexes']);
    expect(search.search('retry', { tag: 'api' }).length).toBe(1);
    expect(search.search('retry', { tag: 'nope' })).toEqual([]);
    expect(search.search('lookups', { difficulty: 'intermediate' })).toEqual([]);
  });

  it('builds snippets with matches marked and HTML escaped', () => {
    const snippet = search.search('conflict')[0].sections[0].snippet;
    expect(snippet).toContain('<mark>Conflict</mark>');
    expect(snippet).toMatch(/&lt;<mark>conflicts?<\/mark>s?&gt;/);
    expect(snippet).not.toContain('<conflicts>');
  });

  it('returns nothing for blank queries', () => {
    expect(search.search('   ')).toEqual([]);
  });
});
