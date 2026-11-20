import {
  DEFAULT_TIMEOUT_MS,
  enforceByteLimit,
  MAX_RESOURCE_BYTES,
  SriError,
  validateHttpsUrl,
} from './validate.js';

export function readTextBytes(value, maxBytes = MAX_RESOURCE_BYTES) {
  if (typeof value !== 'string') {
    throw new SriError('INVALID_INPUT', 'Text input must be a string.');
  }
  const bytes = new TextEncoder().encode(value);
  enforceByteLimit(bytes.byteLength, maxBytes);
  return bytes;
}

export async function readFileBytes(file, maxBytes = MAX_RESOURCE_BYTES) {
  if (!file || !Number.isSafeInteger(file.size) || typeof file.arrayBuffer !== 'function') {
    throw new SriError('INVALID_INPUT', 'Choose a readable local file.');
  }
  enforceByteLimit(file.size, maxBytes);
  const bytes = new Uint8Array(await file.arrayBuffer());
  enforceByteLimit(bytes.byteLength, maxBytes);
  return bytes;
}

/** Read a response incrementally; Content-Length alone cannot enforce a size cap. */
export async function readBoundedResponse(response, maxBytes = MAX_RESOURCE_BYTES) {
  if (!response.ok) {
    throw new SriError('HTTP_FAILURE', `The remote server returned HTTP ${response.status}.`);
  }
  const advertised = response.headers?.get('content-length');
  if (advertised && /^\d+$/u.test(advertised)) {
    const size = Number(advertised);
    enforceByteLimit(size, maxBytes);
  }
  if (!response.body || typeof response.body.getReader !== 'function') {
    throw new SriError('NETWORK', 'The browser cannot read a stream for this resource.');
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        throw new SriError('NETWORK', 'The resource returned an unexpected byte stream.');
      }
      total += value.byteLength;
      enforceByteLimit(total, maxBytes);
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.byteLength;
  }
  return result;
}

/** Fetching occurs only following the user's explicit Generate action. */
export async function fetchResourceBytes(value, {
  fetchImpl = globalThis.fetch,
  maxBytes = MAX_RESOURCE_BYTES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signal,
} = {}) {
  const url = validateHttpsUrl(value);
  if (typeof fetchImpl !== 'function') {
    throw new SriError('NETWORK', 'Browser fetch is unavailable.');
  }

  const controller = new AbortController();
  let timedOut = false;
  const forwardAbort = () => controller.abort();
  if (signal?.aborted) {
    throw new SriError('CANCELLED', 'The request was cancelled.');
  }
  signal?.addEventListener('abort', forwardAbort, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    // Redirects fail closed: following them could contact an unvalidated host.
    const response = await fetchImpl(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: controller.signal,
    });
    const bytes = await readBoundedResponse(response, maxBytes);
    return { bytes, url, contentType: response.headers?.get('content-type') || '' };
  } catch (error) {
    if (timedOut) {
      throw new SriError('TIMEOUT', 'The request timed out before the resource could be read.', { cause: error });
    }
    if (controller.signal.aborted || signal?.aborted) {
      throw new SriError('CANCELLED', 'The request was cancelled.', { cause: error });
    }
    if (error instanceof SriError) throw error;
    throw new SriError('NETWORK', 'The resource could not be fetched. CORS, a redirect, or a network problem may be responsible.', { cause: error });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
}
