import {
  OktopostError,
  OktopostRateLimitError,
  OktopostAuthError,
  OktopostPermissionError,
  OktopostNotFoundError,
} from './errors.js';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs?: number;
  maxRateLimitWaitMs?: number;
}

const DEFAULT_MAX_RATE_LIMIT_WAIT_MS = 60_000;
const MAX_BACKOFF_MS = 60_000;

export async function retryWithBackoff<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> {
  const {
    maxRetries,
    baseDelayMs = 1_000,
    maxRateLimitWaitMs = DEFAULT_MAX_RATE_LIMIT_WAIT_MS,
  } = config;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof OktopostAuthError ||
        error instanceof OktopostPermissionError ||
        error instanceof OktopostNotFoundError
      ) {
        throw error;
      }

      if (error instanceof OktopostRateLimitError) {
        const waitMs = rateLimitWaitMs(error, attempt + 1, baseDelayMs, maxRateLimitWaitMs);
        if (attempt >= maxRetries || waitMs === undefined) {
          throw error;
        }
        attempt++;
        await sleep(waitMs);
        continue;
      }

      if (error instanceof OktopostError && error.statusCode !== undefined) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }
      }

      if (attempt >= maxRetries) {
        throw error;
      }

      attempt++;
      await sleep(backoffMs(attempt, baseDelayMs));
    }
  }
}

function rateLimitWaitMs(
  error: OktopostRateLimitError,
  attempt: number,
  baseDelayMs: number,
  maxRateLimitWaitMs: number,
): number | undefined {
  if (error.retryAfter !== undefined) {
    const retryAfterMs = error.retryAfter * 1_000;
    return retryAfterMs > maxRateLimitWaitMs ? undefined : retryAfterMs;
  }
  return error.limit === 'user' ? backoffMs(attempt, baseDelayMs) : undefined;
}

function backoffMs(attempt: number, baseDelayMs: number): number {
  return Math.min(baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1_000, MAX_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
