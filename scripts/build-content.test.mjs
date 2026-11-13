// Tests for the content indexer. Run with: npm run test:content
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  analyzeHtml,
  analyzeMarkdown,
  createSlugger,
  extractLinks,
  findUnescapedTags,
  parseRecall,
  resolveLink,
  slugify,
  splitMarkdownFrontMatter,
  stackMatches,
  toPlainText,
  validateLinks,
  validateStacks,
} from './build-content.mjs';

// Shared with src/app/core/text.spec.ts so the indexer and the app always produce the same heading anchors.
const slugCases = JSON.parse(readFileSync(new URL('./fixtures/slug-cases.json', import.meta.url), 'utf8'));

describe('slugify', () => {
  for (const { input, expected } of slugCases) {
    test(`"${input}" → "${expected}"`, () => assert.equal(slugify(input), expected));
  }

  test('createSlugger de-duplicates repeated headings', () => {
    const slug = createSlugger();
    assert.deepEqual([slug('Recall'), slug('Recall'), slug('Recall')], ['recall', 'recall-1', 'recall-2']);
  });

  test('createSlugger falls back to "section" for empty slugs', () => {
    assert.equal(createSlugger()('!!!'), 'section');
  });
});

describe('front matter', () => {
  test('parses strings, quoted values, numbers, booleans and lists', () => {
    const { data, body } = splitMarkdownFrontMatter(
      '---\ntitle: "Auth: Sessions vs Tokens"\norder: 3\ndraft: false\ntags: [a, "b c", d]\n---\nBody text',
    );
    assert.deepEqual(data, { title: 'Auth: Sessions vs Tokens', order: 3, draft: false, tags: ['a', 'b c', 'd'] });
    assert.equal(body, 'Body text');
  });

  test('returns the whole source as body when there is no front matter', () => {
    assert.deepEqual(splitMarkdownFrontMatter('# Just a heading'), { data: {}, body: '# Just a heading' });
  });

  test('handles Windows line endings', () => {
    const { data, body } = splitMarkdownFrontMatter('---\r\ntitle: X\r\n---\r\nBody');
    assert.equal(data.title, 'X');
    assert.equal(body, 'Body');
  });
});

describe('parseRecall', () => {
  test('parses Q/A pairs including multi-line answers', () => {
    const cards = parseRecall('Q: First?\nA: One\n\nQ: Second?\nA: Line 1\n- item\n');
    assert.deepEqual(cards, [
      { q: 'First?', a: 'One' },
      { q: 'Second?', a: 'Line 1\n- item' },
    ]);
  });

  test('drops cards without an answer', () => {
    assert.deepEqual(parseRecall('Q: Orphan question?'), []);
  });
});

describe('analyzeMarkdown', () => {
  const body = [
    'Intro paragraph.',
    '',
    '## First section',
    'Text with [a link](../x/y.md#z) and `[not a link](nope.md)`.',
    '',
    '```ts',
    '## Not a heading inside code',
    '[also not a link](ignored.md)',
    '```',
    '',
    '### Sub section',
    '![diagram](img/d.png)',
    '',
    '#### Deep heading',
    '',
    '## First section',
    '',
    '```recall',
    'Q: Question?',
    'A: Answer.',
    '```',
  ].join('\n');
  const result = analyzeMarkdown(body);

  test('splits sections on h2/h3 only, with de-duplicated anchors', () => {
    assert.deepEqual(
      result.sections.map((s) => s.anchor),
      ['', 'first-section', 'sub-section', 'first-section-1'],
    );
  });

  test('collects anchors for every heading level, ignoring code blocks', () => {
    assert.deepEqual([...result.anchors], ['first-section', 'sub-section', 'deep-heading', 'first-section-1']);
  });

  test('extracts recall cards and indexes their text', () => {
    assert.deepEqual(result.cards, [{ q: 'Question?', a: 'Answer.' }]);
    assert.match(result.sections.at(-1).text, /Question\? Answer\./);
  });

  test('extracts links and images outside code, with body line numbers', () => {
    assert.deepEqual(result.links, [
      { href: '../x/y.md#z', image: false, line: 4 },
      { href: 'img/d.png', image: true, line: 12 },
    ]);
  });
});

describe('analyzeHtml', () => {
  test('reads front matter from an HTML comment, recall scripts and visible text only', () => {
    const html = `<!doctype html>
<!--
---
title: Visualizer
tags: [a, b]
---
-->
<html><head><style>.x{}</style></head><body>
<h2>Hello &amp; welcome</h2><script>const hidden = 1;</script>
<script type="text/x-recall">
Q: Q1?
A: A1
</script></body></html>`;
    const result = analyzeHtml(html);
    assert.equal(result.data.title, 'Visualizer');
    assert.deepEqual(result.data.tags, ['a', 'b']);
    assert.deepEqual(result.cards, [{ q: 'Q1?', a: 'A1' }]);
    assert.equal(result.sections[0].text, 'Hello welcome');
  });
});

describe('toPlainText', () => {
  test('strips Markdown syntax but keeps link and image text', () => {
    assert.equal(
      toPlainText('## Title\n> [!NOTE]\n> **Bold** and [link](x.md) ![alt](y.png)\n| a | b |\n|---|---|'),
      'Title Bold and link alt a b',
    );
  });
});

describe('extractLinks', () => {
  test('handles titles, angle brackets and multiple links per line', () => {
    assert.deepEqual(
      extractLinks('[a](one.md "Title") and [b](<two.md>) plus [c](https://example.com)').map((l) => l.href),
      ['one.md', 'two.md', 'https://example.com'],
    );
  });
});

describe('resolveLink', () => {
  test('relative entry links resolve against the entry folder', () => {
    assert.deepEqual(resolveLink('backend/rest', '../design/solid.md#d-dip'), {
      kind: 'entry',
      slug: 'design/solid',
      anchor: 'd-dip',
    });
  });

  test('same-folder and same-page links', () => {
    assert.equal(resolveLink('backend/rest', 'grpc.md').slug, 'backend/grpc');
    assert.deepEqual(resolveLink('backend/rest', '#status-codes'), { kind: 'entry', slug: 'backend/rest', anchor: 'status-codes' });
  });

  test('absolute app routes, categories and other files', () => {
    assert.deepEqual(resolveLink('x/y', '/a/backend/rest'), { kind: 'entry', slug: 'backend/rest', anchor: '' });
    assert.deepEqual(resolveLink('x/y', '/c/backend'), { kind: 'category', id: 'backend' });
    assert.deepEqual(resolveLink('x/y', '/review'), { kind: 'route', route: '/review' });
    assert.deepEqual(resolveLink('x/y', 'files/sheet.pdf'), { kind: 'file', file: 'x/files/sheet.pdf', root: 'content' });
    assert.deepEqual(resolveLink('x/y', 'pic.png', { image: true }), { kind: 'file', file: 'x/pic.png', root: 'content' });
    assert.deepEqual(resolveLink('x/y', '/favicon.svg', { image: true }), { kind: 'file', file: 'favicon.svg', root: 'public' });
  });

  test('external links are not checked', () => {
    for (const href of ['https://example.com', 'http://x', 'mailto:a@b.c', '//cdn.example.com/x.js']) {
      assert.equal(resolveLink('x/y', href), null, href);
    }
  });
});

describe('validateLinks', () => {
  const entries = new Map([
    ['design/solid', { type: 'markdown', anchors: new Set(['d-dip']) }],
    ['fundamentals/viz', { type: 'html', anchors: new Set() }],
  ]);
  const ctx = { entries, categories: new Set(['design']), fileExists: (root, file) => file === 'design/ok.png' };
  const check = (href, image = false) => validateLinks('design/other', [{ href, image, line: 7 }], ctx);

  test('accepts valid links', () => {
    for (const href of ['solid.md', 'solid.md#d-dip', '../fundamentals/viz.html', '/c/design', '/search', 'https://x.y']) {
      assert.deepEqual(check(href), [], href);
    }
    assert.deepEqual(check('ok.png', true), []);
  });

  test('reports missing entries, headings, categories, routes and files', () => {
    assert.match(check('missing.md')[0], /design\/other:7: link to missing entry/);
    assert.match(check('solid.md#nope')[0], /missing heading "#nope" in "design\/solid"/);
    assert.match(check('../fundamentals/viz.html#x')[0], /interactive entry/);
    assert.match(check('/c/nope')[0], /missing category/);
    assert.match(check('/settings')[0], /unknown app route/);
    assert.match(check('gone.png', true)[0], /image to missing file/);
  });
});

describe('interview stacks', () => {
  const articles = [
    { slug: 'frontend/angular', category: 'frontend', tags: ['angular'], cards: [{}, {}] },
    { slug: 'career/stories', category: 'career', tags: [], cards: [{}] },
    { slug: 'devops/empty', category: 'devops', tags: ['git'], cards: [] },
  ];
  const categories = new Set(['frontend', 'career', 'devops']);

  test('stackMatches by category, tag or slug', () => {
    assert.equal(stackMatches({ tags: ['angular'] }, articles[0]), true);
    assert.equal(stackMatches({ categories: ['career'] }, articles[1]), true);
    assert.equal(stackMatches({ slugs: ['career/stories'] }, articles[1]), true);
    assert.equal(stackMatches({ tags: ['react'] }, articles[0]), false);
  });

  test('accepts valid stacks; unused tags are only warnings', () => {
    const { errors, warnings } = validateStacks(
      [{ id: 'ng', title: 'Angular', tags: ['angular', 'rxjs'] }, { id: 'b', title: 'Behavioural', slugs: ['career/stories'] }],
      articles,
      categories,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, ['interview stack "ng": no entry uses tag "rxjs" yet']);
  });

  test('reports unknown categories and entries, empty stacks, duplicates and missing titles', () => {
    const { errors } = validateStacks(
      [
        { id: 'x', title: 'X', categories: ['nope'], slugs: ['career/missing'] },
        { id: 'git', title: 'Git', tags: ['git'] },
        { id: 'git', title: 'Again', tags: ['angular'] },
        { id: 'untitled', tags: ['angular'] },
      ],
      articles,
      categories,
    );
    assert.deepEqual(errors, [
      'interview stack "x": unknown category "nope"',
      'interview stack "x": unknown entry "career/missing"',
      'interview stack "x": matches no questions',
      'interview stack "git": matches no questions',
      'interview stack "git": duplicate id',
      'interview stack "untitled": needs an "id" and a "title"',
    ]);
  });
});

describe('findUnescapedTags', () => {
  test('flags generics and tags outside backticks only', () => {
    assert.deepEqual(findUnescapedTags('Why is List<Cat> not a List<Animal>?'), ['<Cat>', '<Animal>']);
    assert.deepEqual(findUnescapedTags('Why is `List<Cat>` not a `List<Animal>`?'), []);
    assert.deepEqual(findUnescapedTags('Use a <button> element'), ['<button>']);
    assert.deepEqual(findUnescapedTags('x < y and a > b'), []);
  });
});

describe('interview blocks', () => {
  test('are collected separately from recall cards and indexed for search', () => {
    const result = analyzeMarkdown(
      ['## Topic', '', '```interview', 'Q: Design X?', 'A: Like so.', '```', '', '```recall', 'Q: Fact?', 'A: Yes', '```'].join('\n'),
    );
    assert.deepEqual(result.interviewCards, [{ q: 'Design X?', a: 'Like so.' }]);
    assert.deepEqual(result.cards, [{ q: 'Fact?', a: 'Yes' }]);
    assert.match(result.sections[0].text, /Design X\? Like so\./);
    assert.deepEqual(result.problems, []);
  });

  test('a longer outer fence allows code blocks inside answers', () => {
    const result = analyzeMarkdown(['````interview', 'Q: Write SQL', 'A: Like this:', '```sql', 'SELECT 1;', '```', '````'].join('\n'));
    assert.equal(result.interviewCards.length, 1);
    assert.match(result.interviewCards[0].a, /```sql\nSELECT 1;\n```/);
    assert.deepEqual(result.problems, []);
  });

  test('reports a code block nested inside an equally long fence', () => {
    const result = analyzeMarkdown(['```recall', 'Q: Write SQL', 'A: Like this:', '```sql', 'SELECT 1;', '```', '```'].join('\n'));
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].line, 4);
    assert.match(result.problems[0].message, /use ````recall/);
  });
});
