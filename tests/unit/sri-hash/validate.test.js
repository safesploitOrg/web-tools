import { describe, it, expect } from 'vitest';
import { enforceByteLimit, toDigestAlgorithm, validateHttpsUrl } from '../../../public/assets/js/tools/sri-hash/validate.js';

describe('validateHttpsUrl', () => {
  it('accepts canonical public HTTPS URLs and ports', () => {
    expect(validateHttpsUrl('  https://cdn.jsdelivr.net/npm/library.js  ')).toBe('https://cdn.jsdelivr.net/npm/library.js');
    expect(validateHttpsUrl('https://example.org:8443/a')).toBe('https://example.org:8443/a');
  });

  it.each([
    '', 'http://example.org/app.js', 'javascript:alert(1)', 'file:///etc/passwd',
    'https://alice:password@example.org/a', 'https://localhost/x',
    'https://machine.internal/test', 'https://router.local/file',
    'https://a.example/file', 'https://10.0.0.1/file',
    'https://127.0.0.1/file', 'https://2130706433/file',
    'https://169.254.169.254/latest/meta-data', 'https://172.16.1.1/file',
    'https://192.168.1.1/file', 'https://100.64.1.2/file',
    'https://198.51.100.10/file', 'https://[::1]/test',
    'https://[2606:4700:4700::1111]/test', 'https://example.org/\nHTTP',
  ])('rejects unsupported or unsafe URL: %s', (value) => {
    expect(() => validateHttpsUrl(value)).toThrow();
  });

  it('rejects excessive length', () => {
    expect(() => validateHttpsUrl(`https://example.org/${'x'.repeat(4100)}`)).toThrow();
  });
});

describe('limits and algorithms', () => {
  it('accepts zero and the configured byte limit', () => {
    expect(() => enforceByteLimit(0, 3)).not.toThrow();
    expect(() => enforceByteLimit(3, 3)).not.toThrow();
  });
  it('rejects oversize and invalid counts', () => {
    expect(() => enforceByteLimit(4, 3)).toThrow();
    expect(() => enforceByteLimit(-1)).toThrow();
    expect(() => enforceByteLimit(NaN)).toThrow();
  });
  it('enforces the algorithm allowlist', () => {
    expect(toDigestAlgorithm('sha384')).toBe('SHA-384');
    expect(() => toDigestAlgorithm('sha1')).toThrow();
    expect(() => toDigestAlgorithm('__proto__')).toThrow();
  });
});
