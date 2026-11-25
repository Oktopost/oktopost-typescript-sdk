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

export const DEFAULT_MAX_RATE_LIMIT_WAIT_MS = 60_000;
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
        const waitMs = rateLimitWaitMs(error, attempt + 1, baseDelayMs);
        if (attempt >= maxRetries || waitMs === undefined || waitMs > maxRateLimitWaitMs) {
          throw error;
        }
        attempt++;
        await sleep(waitMs);
        continue;
      }

      if (error instanceof OktopostError && error.statusCode !== undefined) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
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

/**
 * Retry-After when the API sent it. Without it a burst block can last up to 15 minutes, so the wait is unknown; the
 * plan limit's per-second cap clears within a second, so it gets the usual backoff.
 */
function rateLimitWaitMs(
  error: OktopostRateLimitError,
  attempt: number,
  baseDelayMs: number,
): number | undefined {
  if (error.retryAfter !== undefined) {
    return error.retryAfter * 1_000;
  }
  return error.limit === 'user' ? backoffMs(attempt, baseDelayMs) : undefined;
}

function backoffMs(attempt: number, baseDelayMs: number): number {
  return Math.min(baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1_000, MAX_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
