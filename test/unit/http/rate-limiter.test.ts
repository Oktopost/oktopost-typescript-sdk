import { RateLimiter } from '../../../src/http/rate-limiter.js';

async function acquireMany(limiter: RateLimiter, count: number): Promise<void> {
  await Promise.all(Array.from({ length: count }, () => limiter.acquire()));
}

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not delay when under all limits', async () => {
    const limiter = new RateLimiter();
    const promise = limiter.acquire();
    await vi.advanceTimersByTimeAsync(0);
    await expect(promise).resolves.toBeUndefined();
  });

  it('counts calls started in parallel before they are sent', async () => {
    const limiter = new RateLimiter();
    let acquired = 0;
    const calls = Array.from({ length: 52 }, () => limiter.acquire().then(() => acquired++));

    await vi.advanceTimersByTimeAsync(0);
    expect(acquired).toBe(51);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(acquired).toBe(52);
    await Promise.all(calls);
  });

  it('delays at the 5-second limit until the oldest call leaves the window', async () => {
    const limiter = new RateLimiter();
    const acquireAt0 = acquireMany(limiter, 51);
    await vi.advanceTimersByTimeAsync(1_000);
    await acquireAt0;
    const acquireAt1000 = acquireMany(limiter, 51);
    await vi.advanceTimersByTimeAsync(0);
    await acquireAt1000;

    let resolved = false;
    void limiter.acquire().then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(3_999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it('checks every limit again after each sleep', async () => {
    const limiter = new RateLimiter();
    let acquired = 0;
    const calls = Array.from({ length: 103 }, () => limiter.acquire().then(() => acquired++));

    await vi.advanceTimersByTimeAsync(1_000);
    expect(acquired).toBe(102);

    await vi.advanceTimersByTimeAsync(3_999);
    expect(acquired).toBe(102);

    await vi.advanceTimersByTimeAsync(1);
    expect(acquired).toBe(103);
    await Promise.all(calls);
  });
});
