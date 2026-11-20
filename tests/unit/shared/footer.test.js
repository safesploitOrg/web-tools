import { describe, it, expect } from 'vitest';
import { setCurrentYear } from '../../../public/assets/js/shared/footer.js';

describe('shared footer year', () => {
  it('sets the year from the supplied date on an existing element', () => {
    const element = { textContent: '2026' };
    const root = { querySelector: (selector) => selector === '[data-current-year]' ? element : null };
    expect(setCurrentYear(root, new Date('2030-06-01T00:00:00Z'))).toBe(true);
    expect(element.textContent).toBe('2030');
  });

  it('does not fail when the element is absent', () => {
    const root = { querySelector: () => null };
    expect(setCurrentYear(root, new Date('2030-06-01T00:00:00Z'))).toBe(false);
    expect(setCurrentYear(null, new Date('2030-06-01T00:00:00Z'))).toBe(false);
  });
});
