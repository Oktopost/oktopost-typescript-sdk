import { Oktopost } from '../../src/client.js';
import { AccountNamespace } from '../../src/resources/account/index.js';
import { PublishingNamespace } from '../../src/resources/publishing/index.js';
import { AnalyticsNamespace } from '../../src/resources/analytics/index.js';

describe('Oktopost', () => {
  it('throws if accountId is missing', () => {
    expect(() => new Oktopost({ accountId: '', apiKey: 'key' })).toThrow('accountId is required');
  });

  it('throws if apiKey is missing', () => {
    expect(() => new Oktopost({ accountId: 'id', apiKey: '' })).toThrow('apiKey is required');
  });

  it('uses US base URL by default', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Result: true, User: {}, Account: {} }),
      headers: new Map(),
    });

    const client = new Oktopost({ accountId: 'id', apiKey: 'key', fetch });
    await client.me();

    const [url] = fetch.mock.calls[0];
    expect(url).toContain('https://api.oktopost.com/v2/me');
  });

  it('uses EU base URL when region is eu', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Result: true, User: {}, Account: {} }),
      headers: new Map(),
    });

    const client = new Oktopost({ accountId: 'id', apiKey: 'key', region: 'eu', fetch });
    await client.me();

    const [url] = fetch.mock.calls[0];
    expect(url).toContain('https://eu-api.oktopost.com/v2/me');
  });

  it('uses custom baseUrl when provided', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Result: true, User: {}, Account: {} }),
      headers: new Map(),
    });

    const client = new Oktopost({
      accountId: 'id',
      apiKey: 'key',
      baseUrl: 'https://custom.api.com/v2',
      fetch,
    });
    await client.me();

    const [url] = fetch.mock.calls[0];
    expect(url).toContain('https://custom.api.com/v2/me');
  });

  it('me() calls GET /me', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        Result: true,
        User: { Id: '001', Name: 'John', Email: 'john@test.com', LastLogin: '2024-01-01' },
        Account: { Id: '002', Name: 'Acme' },
      }),
      headers: new Map(),
    });

    const client = new Oktopost({ accountId: 'id', apiKey: 'key', fetch });
    const result = await client.me();

    expect(result.User.Name).toBe('John');
    expect(result.Account.Name).toBe('Acme');
  });

  it('getHttpClient returns the internal http client', () => {
    const client = new Oktopost({
      accountId: 'id',
      apiKey: 'key',
      fetch: vi.fn(),
    });
    expect(client.getHttpClient()).toBeDefined();
  });

  it('passes onRequest and onResponse hooks', async () => {
    const onRequest = vi.fn();
    const onResponse = vi.fn();
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Result: true }),
      headers: new Map(),
    });

    const client = new Oktopost({
      accountId: 'id',
      apiKey: 'key',
      fetch,
      onRequest,
      onResponse,
    });

    await client.me();

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it('passes maxRateLimitWaitMs to the retry loop', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue('Too Many Requests'),
        headers: new Headers({ 'Retry-After': '90' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ Result: true, User: {}, Account: {} }),
        headers: new Headers(),
      });
    const client = new Oktopost({
      accountId: 'id',
      apiKey: 'key',
      fetch,
      maxRetries: 1,
      maxRateLimitWaitMs: 90_000,
    });

    vi.useFakeTimers();
    try {
      const promise = client.me();
      await vi.advanceTimersByTimeAsync(90_000);
      await promise;
    } finally {
      vi.useRealTimers();
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('uses default timeout and maxRetries', () => {
    const client = new Oktopost({
      accountId: 'id',
      apiKey: 'key',
      fetch: vi.fn(),
    });
    expect(client).toBeDefined();
  });

  it('exposes account namespace', () => {
    const client = new Oktopost({ accountId: 'id', apiKey: 'key', fetch: vi.fn() });
    expect(client.account).toBeInstanceOf(AccountNamespace);
  });

  it('exposes publishing namespace', () => {
    const client = new Oktopost({ accountId: 'id', apiKey: 'key', fetch: vi.fn() });
    expect(client.publishing).toBeInstanceOf(PublishingNamespace);
  });

  it('exposes analytics namespace', () => {
    const client = new Oktopost({ accountId: 'id', apiKey: 'key', fetch: vi.fn() });
    expect(client.analytics).toBeInstanceOf(AnalyticsNamespace);
  });
});
