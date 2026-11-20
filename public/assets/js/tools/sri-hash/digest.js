import { SriError, toDigestAlgorithm } from './validate.js';

/** Hash exact bytes and return the W3C SRI algorithm-base64 token. */
export async function createIntegrityToken(
  bytes,
  algorithm = 'sha384',
  subtle = globalThis.crypto?.subtle,
) {
  const digestAlgorithm = toDigestAlgorithm(algorithm);
  if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes)) {
    throw new SriError('INVALID_INPUT', 'The hashing engine requires binary data.');
  }
  if (!subtle || typeof subtle.digest !== 'function') {
    throw new SriError(
      'CRYPTO_UNAVAILABLE',
      'Web Crypto is unavailable. Open this page over HTTPS or localhost.',
    );
  }

  // For an ArrayBuffer view, preserve its exact byte offset and byte length.
  const source =
    bytes instanceof ArrayBuffer
      ? bytes
      : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const hashed = await subtle.digest(digestAlgorithm, source);
  const encoded = btoa(String.fromCharCode(...new Uint8Array(hashed)));
  return `${algorithm}-${encoded}`;
}
