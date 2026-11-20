import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchResourceBytes,
  readBoundedResponse,
  readFileBytes,
  readTextBytes,
} from '../../../public/assets/js/tools/sri-hash/input.js';

afterEach(() => vi.useRealTimers());

describe('local inputs', () => {
  it('encodes UTF-8 exactly and allows raw empty bytes', () => {
    expect(Array.from(readTextBytes('é'))).toEqual([0xc3, 0xa9]);
    expect(readTextBytes('').byteLength).toBe(0);
  });
  it('rejects oversized UTF-8 data', () => {
    expect(() => readTextBytes('éé', 3)).toThrow();
  });
  it('reads local file bytes without a network call', async () => {
    const file = { size: 3, arrayBuffer: async () => Uint8Array.from([0, 255, 4]).buffer };
    expect(Array.from(await readFileBytes(file))).toEqual([0, 255, 4]);
  });
  it('refuses oversized files before calling arrayBuffer', async () => {
    const spy = vi.fn();
    await expect(readFileBytes({ size: 12, arrayBuffer: spy }, 10)).rejects.toMatchObject({
      code: 'TOO_LARGE',
    });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('bounded network streaming', () => {
  it('reads a valid CORS response with strict fetch options', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { 'content-type': 'text/javascript', 'content-length': '3' },
        }),
    );
    const result = await fetchResourceBytes('https://cdn.example.org/a.js', { fetchImpl });
    expect(Array.from(result.bytes)).toEqual([1, 2, 3]);
    expect(result.contentType).toBe('text/javascript');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://cdn.example.org/a.js',
      expect.objectContaining({
        redirect: 'error',
        credentials: 'omit',
        mode: 'cors',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
      }),
    );
  });

  it('rejects non-2xx HTTP statuses', async () => {
    await expect(readBoundedResponse(new Response('nope', { status: 404 }))).rejects.toMatchObject({
      code: 'HTTP_FAILURE',
    });
  });

  it('blocks an excessive Content-Length early', async () => {
    const response = new Response(new Uint8Array([1]), { headers: { 'content-length': '50' } });
    await expect(readBoundedResponse(response, 2)).rejects.toMatchObject({ code: 'TOO_LARGE' });
  });

  it('blocks an oversized streamed response with no Content-Length', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3, 4]));
      },
    });
    await expect(
      readBoundedResponse({ ok: true, headers: new Headers(), body }, 3),
    ).rejects.toMatchObject({ code: 'TOO_LARGE' });
  });

  it('does not fetch any disallowed target', async () => {
    const fetchImpl = vi.fn();
    await expect(fetchResourceBytes('https://127.0.0.1/a', { fetchImpl })).rejects.toMatchObject({
      code: 'BLOCKED_TARGET',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports redirect refusal or CORS failures as network errors', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(
      fetchResourceBytes('https://cdn.example.org/x.js', { fetchImpl }),
    ).rejects.toMatchObject({ code: 'NETWORK' });
  });

  it('supports cancellation', async () => {
    const request = new AbortController();
    const fetchImpl = (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener(
          'abort',
          () => reject(new DOMException('cancelled', 'AbortError')),
          { once: true },
        );
      });
    const result = fetchResourceBytes('https://cdn.example.org/a.js', {
      fetchImpl,
      signal: request.signal,
    });
    request.abort();
    await expect(result).rejects.toMatchObject({ code: 'CANCELLED' });
  });

  it('reports timeouts distinctly from user cancellations', async () => {
    vi.useFakeTimers();
    const fetchImpl = (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener(
          'abort',
          () => reject(new DOMException('timeout', 'AbortError')),
          { once: true },
        );
      });
    const pending = fetchResourceBytes('https://cdn.example.org/a.js', {
      fetchImpl,
      timeoutMs: 200,
    });
    const assertion = expect(pending).rejects.toMatchObject({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(200);
    await assertion;
  });
});
