import slugCases from '../../../scripts/fixtures/slug-cases.json';
import { createSlugger, dirOf, escapeHtml, parseRecall, resolvePath, slugify, stripFrontMatter } from './text';

describe('text helpers', () => {
  describe('slugify (shared fixture with the content indexer)', () => {
    // If this fails, search deep links and heading anchors will disagree — keep text.ts in sync with
    // scripts/build-content.mjs, which runs the same cases in scripts/build-content.test.mjs.
    for (const { input, expected } of slugCases) {
      it(`"${input}" → "${expected}"`, () => expect(slugify(input)).toBe(expected));
    }
  });

  it('createSlugger de-duplicates repeated headings', () => {
    const slug = createSlugger();
    expect([slug('Recall'), slug('Recall'), slug('Other')]).toEqual(['recall', 'recall-1', 'other']);
  });

  it('parseRecall parses multi-line answers and drops incomplete cards', () => {
    expect(parseRecall('Q: One?\nA: First\nline two\n\nQ: Orphan?')).toEqual([{ q: 'One?', a: 'First\nline two' }]);
  });

  it('resolvePath handles ./ and ../ segments', () => {
    expect(resolvePath('backend', '../design/solid.md')).toBe('design/solid.md');
    expect(resolvePath('backend', './grpc.md')).toBe('backend/grpc.md');
    expect(resolvePath('', 'top.md')).toBe('top.md');
  });

  it('dirOf returns the folder of a slug', () => {
    expect(dirOf('backend/rest-api-design')).toBe('backend');
    expect(dirOf('top-level')).toBe('');
  });

  it('stripFrontMatter removes only the leading block', () => {
    expect(stripFrontMatter('---\ntitle: X\n---\nBody\n---\nnot front matter')).toBe('Body\n---\nnot front matter');
    expect(stripFrontMatter('No front matter')).toBe('No front matter');
  });

  it('escapeHtml escapes markup characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});
