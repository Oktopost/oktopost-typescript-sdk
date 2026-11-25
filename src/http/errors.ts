/** `Errors` of an API response. The plan limit sends `{ API: { RateLimit: '...' } }`, without an `Error` key. */
export type OktopostApiErrors = Record<string, { Error: string }>;

/** Which limit refused the call: `user` is the per-user API plan limit, `burst` a short block after too many calls. */
export type OktopostRateLimit = 'user' | 'burst';

export class OktopostError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'OktopostError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstErrorMessage(errors: unknown): string | undefined {
  if (!isRecord(errors)) {
    return undefined;
  }
  for (const fieldErrors of Object.values(errors)) {
    if (!isRecord(fieldErrors)) {
      continue;
    }
    for (const message of Object.values(fieldErrors)) {
      if (typeof message === 'string' && message !== '') {
        return message;
      }
    }
  }
  return undefined;
}

function apiErrorKey(errors: unknown, key: string): string | undefined {
  const api = isRecord(errors) ? errors.API : undefined;
  const value = isRecord(api) ? api[key] : undefined;
  return typeof value === 'string' ? value : undefined;
}

export class OktopostApiError extends OktopostError {
  readonly errors?: OktopostApiErrors;

  constructor(message: string, statusCode: number, errors?: OktopostApiErrors) {
    super(message, statusCode);
    this.name = 'OktopostApiError';
    this.errors = errors;
  }

  static fromResponse(statusCode: number, data: { Errors?: OktopostApiErrors }): OktopostApiError {
    const apiErrorMessage =
      data.Errors?.API?.Error ?? firstErrorMessage(data.Errors) ?? 'Unknown API error';
    return new OktopostApiError(apiErrorMessage, statusCode, data.Errors);
  }
}

export class OktopostAuthError extends OktopostError {
  constructor(message: string = 'Authentication failed: invalid Account ID or API Key') {
    super(message, 401);
    this.name = 'OktopostAuthError';
  }
}

export class OktopostPermissionError extends OktopostApiError {
  constructor(message: string = 'Insufficient permissions for this resource') {
    super(message, 403);
    this.name = 'OktopostPermissionError';
  }
}

export class OktopostNotFoundError extends OktopostApiError {
  constructor(message: string = 'The requested resource was not found') {
    super(message, 404);
    this.name = 'OktopostNotFoundError';
  }
}

export interface OktopostRateLimitErrorOptions {
  /** HTTP status of the response: 429, or 400 for the per-user plan limit on API versions that still answer 400. */
  statusCode?: number;
  limit?: OktopostRateLimit;
  /** Seconds to wait before retrying, from the `Retry-After` header. */
  retryAfter?: number;
  errors?: OktopostApiErrors;
}

export class OktopostRateLimitError extends OktopostApiError {
  readonly limit: OktopostRateLimit;
  readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    options: OktopostRateLimitErrorOptions = {},
  ) {
    super(message, options.statusCode ?? 429, options.errors);
    this.name = 'OktopostRateLimitError';
    this.limit = options.limit ?? 'burst';
    this.retryAfter = options.retryAfter;
  }
}

export function rateLimitErrorFromResponse(
  statusCode: number,
  data: { Errors?: OktopostApiErrors } | undefined,
  retryAfterHeader: string | null | undefined,
  bodyText?: string,
): OktopostRateLimitError | undefined {
  const planLimitMessage = apiErrorKey(data?.Errors, 'RateLimit');
  if (statusCode !== 429 && planLimitMessage === undefined) {
    return undefined;
  }

  return new OktopostRateLimitError(
    planLimitMessage ??
      firstErrorMessage(data?.Errors) ??
      (bodyText?.trim() || 'Too Many Requests'),
    {
      statusCode,
      limit: planLimitMessage === undefined ? 'burst' : 'user',
      retryAfter: parseRetryAfter(retryAfterHeader),
      errors: data?.Errors,
    },
  );
}

export class OktopostTimeoutError extends OktopostError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'OktopostTimeoutError';
  }
}

/** RFC 9110 IMF-fixdate, the HTTP date `Retry-After` may carry; `Date.parse` alone accepts values such as "1.5". */
const HTTP_DATE = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

export function parseRetryAfter(
  value: string | null | undefined,
  now: number = Date.now(),
): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (!HTTP_DATE.test(trimmed)) {
    return undefined;
  }

  const retryAt = Date.parse(trimmed);
  if (Number.isNaN(retryAt)) {
    return undefined;
  }

  return Math.max(0, Math.ceil((retryAt - now) / 1_000));
}
