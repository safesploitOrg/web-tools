/** Input policy shared by the SRI byte adapters and snippet formatter. */
export const MAX_RESOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_URL_LENGTH = 4096;
export const DEFAULT_TIMEOUT_MS = 15_000;

const ALGORITHM_NAMES = Object.freeze({
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
});

export class SriError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = 'SriError';
    this.code = code;
  }
}

export function toDigestAlgorithm(algorithm) {
  if (!Object.hasOwn(ALGORITHM_NAMES, algorithm)) {
    throw new SriError('INVALID_ALGORITHM', 'Choose SHA-256, SHA-384 or SHA-512.');
  }
  return ALGORITHM_NAMES[algorithm];
}

export function enforceByteLimit(size, maxBytes = MAX_RESOURCE_BYTES) {
  if (!Number.isSafeInteger(size) || size < 0 || size > maxBytes) {
    throw new SriError('TOO_LARGE', `Resource exceeds the ${Math.floor(maxBytes / (1024 * 1024))} MiB limit, or its size is invalid.`);
  }
}

/**
 * Browser URL validation is advisory against obvious local targets; it cannot
 * resolve DNS or defend against DNS rebinding. Never describe it as an SSRF firewall.
 */
export function validateHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new SriError('INVALID_URL', 'Enter a complete HTTPS resource URL.');
  }

  const input = value.trim();
  if (input.length > MAX_URL_LENGTH || /[\u0000-\u001F\u007F]/u.test(input)) {
    throw new SriError('INVALID_URL', 'The URL contains invalid characters or is too long.');
  }
  if (!/^https:\/\//iu.test(input)) {
    throw new SriError('INVALID_URL', 'Only HTTPS resource URLs are supported.');
  }

  let url;
  try {
    url = new URL(input);
  } catch {
    throw new SriError('INVALID_URL', 'Enter a valid, complete HTTPS URL.');
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new SriError('INVALID_URL', 'Only HTTPS URLs without embedded credentials are supported.');
  }

  const host = url.hostname.toLowerCase().replace(/\.$/u, '');
  const localSuffixes = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.test', '.invalid', '.example'];
  if (!host.includes('.') || host === 'localhost' || localSuffixes.some((suffix) => host.endsWith(suffix))) {
    throw new SriError('BLOCKED_TARGET', 'Local, internal and unqualified hostnames are not supported.');
  }

  // IPv6 literals deliberately remain out of scope for this first release.
  if (host.startsWith('[') && host.endsWith(']')) {
    throw new SriError('BLOCKED_TARGET', 'IP-address literals using IPv6 are not supported. Use a public hostname.');
  }

  if (/^\d+\.\d+\.\d+\.\d+$/u.test(host)) {
    const octets = host.split('.').map(Number);
    const [a, b, c] = octets;
    const blocked =
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || (b === 168) || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113);
    if (blocked) {
      throw new SriError('BLOCKED_TARGET', 'Local, private, reserved and documentation IP addresses are not supported.');
    }
  }

  return url.toString();
}
