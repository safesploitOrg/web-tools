import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const HOME = readFileSync(new URL('../../../public/index.html', import.meta.url), 'utf8');

describe('compact homepage', () => {
  it('omits the oversized marketing headline and tick-box claims', () => {
    for (const removed of [
      'Practical tools.',
      'Less friction.',
      'Local processing by default',
      'Source available',
      'Zero runtime dependencies',
      'hero-points',
    ]) {
      expect(HOME).not.toContain(removed);
    }
  });

  it('retains a primary catalogue heading and the SRI tool route', () => {
    expect(HOME).toContain('<h1 id="catalogue-title">Available tools</h1>');
    expect(HOME).toContain('href="./sri-hash/"');
    expect(HOME).toContain('BROWSER-FIRST UTILITIES');
  });

  it('preserves the dynamic copyright year and repository link', () => {
    expect(HOME).toContain('data-current-year');
    expect(HOME).toContain('https://github.com/safesploitOrg/web-tools');
  });
});
