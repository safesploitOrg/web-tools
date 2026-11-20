import { SriError, toDigestAlgorithm, validateHttpsUrl } from './validate.js';

export function escapeHtmlAttribute(value) {
  return value.replace(/&/gu, '&amp;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;');
}

/** Generate inert text for copying; the caller must not insert it as HTML. */
export function createHtmlSnippet({ resourceUrl, integrity, resourceType = 'script' }) {
  const safeUrl = escapeHtmlAttribute(validateHttpsUrl(resourceUrl));
  const match = /^(sha256|sha384|sha512)-([A-Za-z0-9+/]+={0,2})$/u.exec(integrity || '');
  if (!match) {
    throw new SriError('INVALID_INTEGRITY', 'The integrity token has an invalid format.');
  }
  const [, algorithm, base64] = match;
  toDigestAlgorithm(algorithm);
  const expectedLength = { sha256: 44, sha384: 64, sha512: 88 }[algorithm];
  if (base64.length !== expectedLength || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(base64)) {
    throw new SriError('INVALID_INTEGRITY', 'The integrity token is not a complete Base64 digest.');
  }

  if (resourceType === 'style') {
    return `<link rel="stylesheet" href="${safeUrl}" integrity="${integrity}" crossorigin="anonymous">`;
  }
  if (resourceType === 'script') {
    return `<script src="${safeUrl}" integrity="${integrity}" crossorigin="anonymous"></script>`;
  }
  throw new SriError('INVALID_INPUT', 'Select JavaScript or Stylesheet.');
}
