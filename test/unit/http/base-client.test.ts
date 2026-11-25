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
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    headers: new Headers(headers),
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

  it('distinguishes empty-string from undefined in form body (clears vs omits)', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.put('/calendar/custom-events', { id: '0CE1', campaignIds: '' });

    const [, withEmpty] = fetch.mock.calls[0];
    const decodedEmpty = new URLSearchParams(withEmpty.body as string);
    expect(decodedEmpty.has('campaignIds')).toBe(true);
    expect(decodedEmpty.get('campaignIds')).toBe('');

    await client.put('/calendar/custom-events', { id: '0CE1', campaignIds: undefined });

    const [, withUndefined] = fetch.mock.calls[1];
    const decodedUndefined = new URLSearchParams(withUndefined.body as string);
    expect(decodedUndefined.has('campaignIds')).toBe(false);
  });

  it('drops empty arrays from form body', async () => {
    const fetch = mockFetch(200, { Result: true });
    const client = createClient({ fetch });

    await client.put('/example', { campaignIds: [] });

    const [, options] = fetch.mock.calls[0];
    const decoded = new URLSearchParams(options.body as string);
    expect(decoded.has('campaignIds')).toBe(false);
    expect(decoded.has('campaignIds[]')).toBe(false);
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

  it('maps a plain-text 429 to a burst OktopostRateLimitError with Retry-After', async () => {
    const fetch = mockFetch(429, 'Too Many Requests', { 'Retry-After': '30' });
    const client = createClient({ fetch });

    const error = await client.get('/campaign').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(OktopostRateLimitError);
    expect(error).toMatchObject({
      message: 'Too Many Requests',
      statusCode: 429,
      limit: 'burst',
      retryAfter: 30,
    });
  });

  it('keeps the text of a plain-text 429 body as the message', async () => {
    const fetch = mockFetch(429, 'Blocked for 15 minutes');
    const client = createClient({ fetch });

    await expect(client.get('/campaign')).rejects.toMatchObject({
      message: 'Blocked for 15 minutes',
    });
  });

  it('reads the message of a JSON 429 body', async () => {
    const fetch = mockFetch(429, {
      Result: false,
      Errors: { API: { BurstLimit: 'Account blocked' } },
    });
    const client = createClient({ fetch });

    await expect(client.get('/campaign')).rejects.toMatchObject({
      message: 'Account blocked',
      limit: 'burst',
      retryAfter: undefined,
    });
  });

  it('maps a 429 carrying Errors.API.RateLimit to a user OktopostRateLimitError', async () => {
    const errors = { API: { RateLimit: 'Rate limit exceeded' } };
    const fetch = mockFetch(429, { Result: false, Errors: errors });
    const client = createClient({ fetch });

    await expect(client.get('/campaign')).rejects.toMatchObject({
      message: 'Rate limit exceeded',
      statusCode: 429,
      limit: 'user',
      errors,
    });
  });

  it('maps a 429 whose body cannot be read to a burst OktopostRateLimitError', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: vi.fn().mockRejectedValue(new Error('body stream already read')),
      headers: new Headers(),
    });
    const client = createClient({ fetch });

    await expect(client.get('/campaign')).rejects.toMatchObject({
      message: 'Too Many Requests',
      statusCode: 429,
      limit: 'burst',
    });
  });

  it('maps a non-429 Errors.API.RateLimit to a user OktopostRateLimitError', async () => {
    const errors = { API: { RateLimit: 'Rate limit exceeded' } };
    const fetch = mockFetch(400, {
      Result: false,
      Errors: errors,
      Codes: { API: { RateLimit: -1 } },
    });
    const client = createClient({ fetch });

    const error = await client.get('/campaign').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(OktopostRateLimitError);
    expect(error).toBeInstanceOf(OktopostApiError);
    expect(error).toMatchObject({
      message: 'Rate limit exceeded',
      statusCode: 400,
      limit: 'user',
      errors,
    });
  });

  it('retries a rate limit after its Retry-After', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(await mockFetch(429, 'Too Many Requests', { 'Retry-After': '2' })())
      .mockResolvedValueOnce(await mockFetch(200, { Result: true, Campaigns: [] })());
    const client = createClient({ fetch, maxRetries: 1 });

    vi.useFakeTimers();
    try {
      const promise = client.get('/campaign');
      await vi.advanceTimersByTimeAsync(1_999);
      expect(fetch).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      await expect(promise).resolves.toEqual({ Result: true, Campaigns: [] });
    } finally {
      vi.useRealTimers();
    }
    expect(fetch).toHaveBeenCalledTimes(2);
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
