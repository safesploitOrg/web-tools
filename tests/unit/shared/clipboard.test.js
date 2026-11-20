import { describe, it, expect, vi } from 'vitest';
import { copyPlainText } from '../../../public/assets/js/shared/clipboard.js';

describe('clipboard helper', () => {
  it('copies exact data to the supplied secure clipboard interface', async () => {
    const writeText = vi.fn(async () => {});
    await copyPlainText('sha384-example', { writeText });
    expect(writeText).toHaveBeenCalledExactlyOnceWith('sha384-example');
  });
  it('reports denied or absent clipboard access', async () => {
    await expect(copyPlainText('hello', null)).rejects.toThrow('unavailable');
    await expect(
      copyPlainText('hello', {
        writeText: async () => {
          throw new Error('denied');
        },
      }),
    ).rejects.toThrow('denied');
  });
});
