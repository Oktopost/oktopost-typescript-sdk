import { BaseHttpClient } from '../../../src/http/base-client.js';
import {
  OktopostAuthError,
  OktopostPermissionError,
  OktopostNotFoundError,
  OktopostRateLimitError,
  OktopostTimeoutError,
  OktopostApiError,
} from '../../../src/http/errors.js';

function createClient(overrides: Partial<Parameters<typeof createClientFull>[0]> = {}) {
  return createClientFull(overrides);
}

function createClientFull(
  overrides: {
    fetch?: typeof globalThis.fetch;
    onRequest?: (info: any) => void;
    onResponse?: (info: any) => void;
    timeout?: number;
    maxRetries?: number;
  } = {},
) {
  return new BaseHttpClient({
    baseUrl: 'https://api.oktopost.com/v2',
    accountId: 'testAccount',
    apiKey: 'testKey',
    timeout: overrides.timeout ?? 30_000,
    maxRetries: overrides.maxRetries ?? 0,
    fetch: overrides.fetch,
    onRequest: overrides.onRequest,
    onResponse: overrides.onResponse,
  });
}

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    headers: new Map(Object.entries(headers)),
  });
}

describe('BaseHttpClient', () => {
  it('sends correct Authorization header', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.get('/me');

    const [, options] = fetch.mock.calls[0];
    const expectedAuth =
      'Basic ' + Buffer.from('testAccount:testKey', 'utf-8').toString('base64');
    expect(options.headers.Authorization).toBe(expectedAuth);
  });

  it('sends User-Agent header', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.get('/me');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['User-Agent']).toMatch(/^oktopost-node\//);
  });

  it('builds correct URL with query params', async () => {
    const fetch = mockFetch(200, { Result: true, Items: [], Total: 0 });
    const client = createClient({ fetch });

    await client.get('/campaign', { status: 'active', _count: 100 });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain('status=active');
    expect(url).toContain('_count=100');
  });

  it('skips null and undefined params', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.get('/campaign', { status: 'active', filter: null, extra: undefined });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain('status=active');
    expect(url).not.toContain('filter');
    expect(url).not.toContain('extra');
  });

  it('sends form-encoded POST body', async () => {
    const fetch = mockFetch(200, { Result: true, Campaign: {} });
    const client = createClient({ fetch });

    await client.post('/campaign', { name: 'Test', url: 'https://example.com' });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(options.body).toContain('name=Test');
    expect(options.body).toContain('url=https');
  });

  it('bracket-encodes nested objects and arrays in form body', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.post('/example', { filters: { campaigns: ['001', '002'] } });

    const [, options] = fetch.mock.calls[0];
    const decoded = new URLSearchParams(options.body as string);
    expect(decoded.getAll('filters[campaigns][]')).toEqual(['001', '002']);
  });

  it('handles PUT requests', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.put('/credential/123', { displayName: 'New Name' });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('PUT');
    expect(options.body).toContain('displayName=New+Name');
  });

  it('handles DELETE requests', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.delete('/campaign/123');

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
  });

  it('handles DELETE with body', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.delete('/resource/123', { reason: 'cleanup' });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
    expect(options.body).toContain('reason=cleanup');
  });

  it('maps 401 to OktopostAuthError', async () => {
    const fetch = mockFetch(401, { Result: false });
    const client = createClient({ fetch });

    await expect(client.get('/me')).rejects.toThrow(OktopostAuthError);
  });

  it('maps 403 to OktopostPermissionError', async () => {
    const fetch = mockFetch(403, { Result: false });
    const client = createClient({ fetch });

    await expect(client.get('/admin')).rejects.toThrow(OktopostPermissionError);
  });

  it('maps 404 to OktopostNotFoundError', async () => {
    const fetch = mockFetch(404, { Result: false });
    const client = createClient({ fetch });

    await expect(client.get('/campaign/999')).rejects.toThrow(OktopostNotFoundError);
  });

  it('maps 429 to OktopostRateLimitError', async () => {
    const fetch = mockFetch(429, {});
    const client = createClient({ fetch });

    await expect(client.get('/campaign')).rejects.toThrow(OktopostRateLimitError);
  });

  it('handles Result: false in response', async () => {
    const fetch = mockFetch(200, {
      Result: false,
      Errors: { API: { Error: 'Campaign not found' } },
    });
    const client = createClient({ fetch });

    await expect(client.get('/campaign/123')).rejects.toThrow('Campaign not found');
  });

  it('handles non-ok status with error body', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ Result: true, Errors: { API: { Error: 'Server err' } } }),
      headers: new Map(),
    });
    const client = createClient({ fetch: fetchFn });

    await expect(client.get('/test')).rejects.toThrow(OktopostApiError);
  });

  it('calls onRequest hook', async () => {
    const fetch = mockFetch(200, { Result: true });
    const onRequest = vi.fn();
    const client = createClient({ fetch, onRequest });

    await client.get('/me');

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest.mock.calls[0][0].method).toBe('GET');
    expect(onRequest.mock.calls[0][0].url).toContain('/me');
  });

  it('calls onResponse hook', async () => {
    const fetch = mockFetch(200, { Result: true });
    const onResponse = vi.fn();
    const client = createClient({ fetch, onResponse });

    await client.get('/me');

    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(onResponse.mock.calls[0][0].status).toBe(200);
    expect(onResponse.mock.calls[0][0].body).toEqual({ Result: true });
    expect(typeof onResponse.mock.calls[0][0].durationMs).toBe('number');
  });

  it('handles timeout as OktopostTimeoutError', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    const fetch = vi.fn().mockRejectedValue(abortError);
    const client = createClient({ fetch, timeout: 100 });

    await expect(client.get('/slow')).rejects.toThrow(OktopostTimeoutError);
  });

  it('skips null/undefined values in form body', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.post('/test', { name: 'valid', empty: null, missing: undefined });

    const [, options] = fetch.mock.calls[0];
    expect(options.body).toContain('name=valid');
    expect(options.body).not.toContain('empty');
    expect(options.body).not.toContain('missing');
  });

  it('does not set body for GET requests', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.get('/test');

    const [, options] = fetch.mock.calls[0];
    expect(options.body).toBeUndefined();
  });

  it('uses globalThis.fetch when no custom fetch provided', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch(200, { Result: true });

    try {
      const client = new BaseHttpClient({
        baseUrl: 'https://api.oktopost.com/v2',
        accountId: 'acc',
        apiKey: 'key',
        timeout: 30_000,
        maxRetries: 0,
      });

      await client.get('/me');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('re-throws non-AbortError exceptions from fetch', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('network error'));
    const client = createClient({ fetch });

    await expect(client.get('/test')).rejects.toThrow(TypeError);
  });

  it('re-throws DOMException that is not AbortError', async () => {
    const domError = new DOMException('some error', 'NotAllowedError');
    const fetch = vi.fn().mockRejectedValue(domError);
    const client = createClient({ fetch });

    await expect(client.get('/test')).rejects.toThrow(DOMException);
  });
});
