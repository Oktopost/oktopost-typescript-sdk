import { parseRetryAfter } from './retry-after.js';

export type OktopostApiErrors = Record<string, Record<string, string>>;

export type OktopostRateLimitKind = 'user' | 'burst';

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
  statusCode?: number;
  limit?: OktopostRateLimitKind;
  retryAfter?: number;
  errors?: OktopostApiErrors;
}

export class OktopostRateLimitError extends OktopostApiError {
  /** `user`: the per-user API plan limit; `burst`: a short block after too many calls. */
  readonly limit: OktopostRateLimitKind;
  /** Seconds to wait before retrying, from the `Retry-After` header. */
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

  static fromResponse(
    statusCode: number,
    data?: { Errors?: OktopostApiErrors },
    retryAfterHeader?: string | null,
    bodyText?: string,
  ): OktopostRateLimitError {
    const userLimitMessage = data?.Errors?.API?.RateLimit;
    return new OktopostRateLimitError(
      userLimitMessage ??
        firstErrorMessage(data?.Errors) ??
        (bodyText?.trim() || 'Too Many Requests'),
      {
        statusCode,
        limit: userLimitMessage === undefined ? 'burst' : 'user',
        retryAfter: parseRetryAfter(retryAfterHeader),
        errors: data?.Errors,
      },
    );
  }
}

export class OktopostTimeoutError extends OktopostError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'OktopostTimeoutError';
  }
}
