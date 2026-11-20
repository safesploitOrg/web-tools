import { describe, it, expect } from 'vitest';
import { createIntegrityToken } from '../../../public/assets/js/tools/sri-hash/digest.js';

// Fixed references generated independently using OpenSSL, not the application.
const VECTORS = [
  { name: 'ASCII', input: new TextEncoder().encode('hello'), hashes: {
    sha256: 'sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=',
    sha384: 'sha384-WeF0h3dEjGnea4ANejO7+5/xtGPkQ1TDVTvNucZm+pASWjx5+QOXvfX2oT3oKGhP',
    sha512: 'sha512-m3HSJL1i83hdltRq0+o9czGb+8KJDKra4t/3JRlnPKcjI8PZm6XBHXx6zG4UuMXaDEZjR1wuXDre9G9zvN7AQw==',
  } },
];

describe('createIntegrityToken', () => {
  for (const vector of VECTORS) {
    for (const [algorithm, expected] of Object.entries(vector.hashes)) {
      it(`matches independent ${vector.name} ${algorithm} reference`, async () => {
        expect(await createIntegrityToken(vector.input, algorithm)).toBe(expected);
      });
    }
  }

  it('hashes exactly the bytes in a sliced Uint8Array', async () => {
    const bytes = new Uint8Array([88, 104, 101, 108, 108, 111, 89]);
    expect(await createIntegrityToken(bytes.subarray(1, 6), 'sha256'))
      .toBe('sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=');
  });

  it('rejects unsupported algorithms and invalid byte types', async () => {
    await expect(createIntegrityToken(new Uint8Array([1]), 'md5')).rejects.toMatchObject({ code: 'INVALID_ALGORITHM' });
    await expect(createIntegrityToken('hello', 'sha256')).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('reports missing Web Crypto rather than producing a fake token', async () => {
    await expect(createIntegrityToken(new Uint8Array([1]), 'sha384', null)).rejects.toMatchObject({ code: 'CRYPTO_UNAVAILABLE' });
  });
});
