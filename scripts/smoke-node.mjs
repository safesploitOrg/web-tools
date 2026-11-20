/** Dependency-free verification for use when npm registry is unavailable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createIntegrityToken } from '../public/assets/js/tools/sri-hash/digest.js';
import { fetchResourceBytes, readFileBytes, readTextBytes, readBoundedResponse } from '../public/assets/js/tools/sri-hash/input.js';
import { createHtmlSnippet } from '../public/assets/js/tools/sri-hash/snippets.js';
import { validateHttpsUrl } from '../public/assets/js/tools/sri-hash/validate.js';
import { setCurrentYear } from '../public/assets/js/shared/footer.js';

async function main() {
  for (const payload of [new Uint8Array(), readTextBytes('hello'), readTextBytes('SRI — 日本語'), new Uint8Array([0, 1, 255])]) {
    for (const alg of ['sha256', 'sha384', 'sha512']) {
      const reference = createHash(alg).update(payload).digest('base64');
      assert.equal(await createIntegrityToken(payload, alg), `${alg}-${reference}`);
    }
  }

  for (const invalid of ['http://example.org/a', 'https://localhost/a', 'https://127.0.0.1/a', 'https://10.0.0.1/a', 'javascript:alert(1)', 'https://[::1]/a']) {
    assert.throws(() => validateHttpsUrl(invalid));
  }

  const fetchImpl = async (_url, options) => {
    assert.equal(options.redirect, 'error');
    assert.equal(options.credentials, 'omit');
    return new Response(new Uint8Array([1, 2, 255]), { headers: { 'content-type': 'application/javascript' } });
  };
  const result = await fetchResourceBytes('https://cdn.example.org/a.js', { fetchImpl });
  assert.deepEqual([...result.bytes], [1, 2, 255]);
  const file = { size: 2, arrayBuffer: async () => Uint8Array.from([0, 255]).buffer };
  assert.deepEqual([...await readFileBytes(file)], [0, 255]);
  await assert.rejects(readFileBytes({ size: 10, arrayBuffer: async () => { throw new Error('read should not occur'); } }, 5), { code: 'TOO_LARGE' });
  await assert.rejects(readBoundedResponse(new Response('hello'), 2), { code: 'TOO_LARGE' });

  const sri = await createIntegrityToken(readTextBytes('hello'), 'sha256');
  const snippet = createHtmlSnippet({ resourceUrl: 'https://cdn.example.org/a.js?a=1&b=2', integrity: sri });
  assert(snippet.includes('a=1&amp;b=2'));
  assert(!snippet.includes('innerHTML'));
  const yearElement = { textContent: '2026' };
  const root = { querySelector: (selector) => selector === '[data-current-year]' ? yearElement : null };
  assert.equal(setCurrentYear(root, new Date('2031-01-01T00:00:00Z')), true);
  assert.equal(yearElement.textContent, '2031');
  assert.equal(setCurrentYear({ querySelector: () => null }), false);

  console.info('PASS: 12 independent hash comparisons, validation, URL/file streaming, safe snippets and dynamic footer year.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
