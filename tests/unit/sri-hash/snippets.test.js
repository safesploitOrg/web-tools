import { describe, it, expect } from 'vitest';
import { createHtmlSnippet, escapeHtmlAttribute } from '../../../public/assets/js/tools/sri-hash/snippets.js';

const INTEGRITY = 'sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=';

describe('createHtmlSnippet', () => {
  it('generates JavaScript and CSS attributes predictably', () => {
    expect(createHtmlSnippet({ resourceUrl: 'https://cdn.jsdelivr.net/a.js', integrity: INTEGRITY })).toBe(
      `<script src="https://cdn.jsdelivr.net/a.js" integrity="${INTEGRITY}" crossorigin="anonymous"></script>`,
    );
    expect(createHtmlSnippet({ resourceUrl: 'https://cdn.jsdelivr.net/a.css', integrity: INTEGRITY, resourceType: 'style' })).toBe(
      `<link rel="stylesheet" href="https://cdn.jsdelivr.net/a.css" integrity="${INTEGRITY}" crossorigin="anonymous">`,
    );
  });

  it('escapes HTML attribute separators rather than interpolating markup', () => {
    expect(escapeHtmlAttribute(`&"'<>`)).toBe('&amp;&quot;&#39;&lt;&gt;');
    const snippet = createHtmlSnippet({ resourceUrl: 'https://example.org/x.js?a=1&b=2', integrity: INTEGRITY });
    expect(snippet).toContain('x.js?a=1&amp;b=2');
  });

  it.each([
    ['resource URL', { resourceUrl: 'javascript:alert(1)', integrity: INTEGRITY }],
    ['short digest', { resourceUrl: 'https://example.org/a', integrity: 'sha256-ZA==' }],
    ['unsupported token', { resourceUrl: 'https://example.org/a', integrity: 'sha1-BBBBBBBBBBBBBB==' }],
    ['unsafe type', { resourceUrl: 'https://example.org/a', integrity: INTEGRITY, resourceType: 'iframe' }],
  ])('rejects invalid %s', (_name, params) => {
    expect(() => createHtmlSnippet(params)).toThrow();
  });
});
