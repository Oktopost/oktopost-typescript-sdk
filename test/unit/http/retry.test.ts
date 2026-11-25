import { retryWithBackoff } from '../../../src/http/retry.js';
import {
  OktopostApiError,
  OktopostAuthError,
  OktopostPermissionError,
  OktopostNotFoundError,
  OktopostRateLimitError,
} from '../../../src/http/errors.js';

describe('retryWithBackoff', () => {
  it('returns on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 5xx errors up to maxRetries', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new OktopostApiError('Server error', 500))
      .mockRejectedValueOnce(new OktopostApiError('Server error', 502))
      .mockResolvedValue('recovered');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 1 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after maxRetries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new OktopostApiError('Server error', 500));
    await expect(retryWithBackoff(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow(
      'Server error',
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry OktopostAuthError', async () => {
    const fn = vi.fn().mockRejectedValue(new OktopostAuthError());
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow(OktopostAuthError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry OktopostPermissionError', async () => {
    const fn = vi.fn().mockRejectedValue(new OktopostPermissionError());
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow(
      OktopostPermissionError,
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry OktopostNotFoundError', async () => {
    const fn = vi.fn().mockRejectedValue(new OktopostNotFoundError());
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow(OktopostNotFoundError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry 400 errors', async () => {
    const fn = vi.fn().mockRejectedValue(new OktopostApiError('Bad request', 400));
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe('rate limits', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('waits for Retry-After before retrying', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new OktopostRateLimitError('Too Many Requests', { retryAfter: 5 }))
        .mockResolvedValue('ok');

      const promise = retryWithBackoff(fn, { maxRetries: 1, baseDelayMs: 1 });
      await vi.advanceTimersByTimeAsync(4_999);
      expect(fn).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);

      await expect(promise).resolves.toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws at once when Retry-After is longer than the wait cap', async () => {
      const error = new OktopostRateLimitError('Too Many Requests', { retryAfter: 61 });
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toBe(error);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('waits longer when the caller raises the wait cap', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new OktopostRateLimitError('Too Many Requests', { retryAfter: 900 }))
        .mockResolvedValue('ok');

      const promise = retryWithBackoff(fn, { maxRetries: 1, maxRateLimitWaitMs: 15 * 60 * 1_000 });
      await vi.advanceTimersByTimeAsync(900_000);

      await expect(promise).resolves.toBe('ok');
    });

    it('throws a burst block without Retry-After, since its length is unknown', async () => {
      const error = new OktopostRateLimitError();
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toBe(error);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries the per-user plan limit answered with 400 after a backoff', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(
          new OktopostRateLimitError('Rate limit exceeded', { statusCode: 400, limit: 'user' }),
        )
        .mockResolvedValue('ok');

      const promise = retryWithBackoff(fn, { maxRetries: 1, baseDelayMs: 1 });
      await vi.advanceTimersByTimeAsync(1_001);

      await expect(promise).resolves.toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws a rate limit once retries are used up', async () => {
      const error = new OktopostRateLimitError('Too Many Requests', { retryAfter: 1 });
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, { maxRetries: 0 })).rejects.toBe(error);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  it('retries generic errors', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValue('ok');

    const result = await retryWithBackoff(fn, { maxRetries: 1, baseDelayMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses default baseDelayMs when not specified', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new OktopostApiError('err', 500))
      .mockResolvedValue('ok');

    vi.useFakeTimers();
    const promise = retryWithBackoff(fn, { maxRetries: 1 });
    await vi.advanceTimersByTimeAsync(2_500);
    const result = await promise;
    vi.useRealTimers();

    expect(result).toBe('ok');
  });
});
