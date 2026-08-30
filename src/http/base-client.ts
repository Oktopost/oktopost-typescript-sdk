import { createAuthHeader } from './auth.js';
import { RateLimiter } from './rate-limiter.js';
import { retryWithBackoff } from './retry.js';
import {
  OktopostError,
  OktopostApiError,
  OktopostAuthError,
  OktopostRateLimitError,
  OktopostTimeoutError,
  OktopostNotFoundError,
  OktopostPermissionError,
} from './errors.js';
import { SDK_VERSION } from '../version.js';
import type { OktopostRequestInfo, OktopostResponseInfo } from '../types/common.js';

export interface HttpClientConfig {
  baseUrl: string;
  accountId: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  fetch?: typeof globalThis.fetch;
  onRequest?: (info: OktopostRequestInfo) => void;
  onResponse?: (info: OktopostResponseInfo) => void;
}

export class BaseHttpClient {
  private readonly config: HttpClientConfig;
  private readonly authHeader: string;
  private readonly rateLimiter: RateLimiter;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.authHeader = createAuthHeader(config.accountId, config.apiKey);
    this.rateLimiter = new RateLimiter();
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async get<T>(path: string, params?: object): Promise<T> {
    return this.request<T>('GET', path, undefined, params as Record<string, unknown>);
  }

  async post<T>(path: string, body?: object): Promise<T> {
    return this.request<T>('POST', path, body as Record<string, unknown>);
  }

  async put<T>(path: string, body?: object): Promise<T> {
    return this.request<T>('PUT', path, body as Record<string, unknown>);
  }

  async delete<T>(path: string, body?: object): Promise<T> {
    return this.request<T>('DELETE', path, body as Record<string, unknown>);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
    queryParams?: Record<string, unknown>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);

    return retryWithBackoff(
      async () => {
        await this.rateLimiter.waitIfNeeded();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const headers: Record<string, string> = {
          Authorization: this.authHeader,
          Accept: 'application/json',
          'User-Agent': `oktopost-node/${SDK_VERSION}`,
        };

        const fetchOptions: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };

        let encodedBody: string | undefined;

        if (body && ['POST', 'PUT', 'DELETE'].includes(method)) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          encodedBody = this.encodeFormBody(body);
          fetchOptions.body = encodedBody;
        }

        this.config.onRequest?.({
          method,
          url,
          headers: { ...headers },
          body: encodedBody,
        });

        let response: Response;
        const startTime = Date.now();

        try {
          response = await this.fetchFn(url, fetchOptions);
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw new OktopostTimeoutError(
              `Request to ${method} ${path} timed out after ${this.config.timeout}ms`,
            );
          }
          throw error;
        }

        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        this.rateLimiter.recordRequest();

        if (response.status === 429) {
          throw new OktopostRateLimitError();
        }

        if (response.status === 401) {
          throw new OktopostAuthError();
        }

        if (response.status === 403) {
          throw new OktopostPermissionError();
        }

        if (response.status === 404) {
          throw new OktopostNotFoundError();
        }

        let data: T & {
          Result?: boolean;
          Errors?: Record<string, { Error: string }>;
        };

        try {
          data = (await response.json()) as T & {
            Result?: boolean;
            Errors?: Record<string, { Error: string }>;
          };
        } catch {
          throw new OktopostError(
            `Failed to parse JSON response from ${method} ${path} (status ${response.status})`,
            response.status,
          );
        }

        this.config.onResponse?.({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
          durationMs,
        });

        if (data.Result === false) {
          throw OktopostApiError.fromResponse(response.status, data);
        }

        if (!response.ok) {
          throw new OktopostApiError(
            `Request failed with status ${response.status}`,
            response.status,
            data.Errors,
          );
        }

        return data;
      },
      { maxRetries: this.config.maxRetries },
    );
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        this.appendEncoded(url.searchParams, key, value);
      }
    }
    return url.toString();
  }

  private encodeFormBody(data: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      this.appendEncoded(params, key, value);
    }
    return params.toString();
  }

  private appendEncoded(params: URLSearchParams, key: string, value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      for (const [index, item] of value.entries()) {
        if (item !== null && typeof item === 'object') {
          this.appendEncoded(params, `${key}[${index}]`, item);
        } else {
          this.appendEncoded(params, `${key}[]`, item);
        }
      }
      return;
    }

    if (typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
        this.appendEncoded(params, `${key}[${childKey}]`, childValue);
      }
      return;
    }

    params.append(key, String(value));
  }
}
