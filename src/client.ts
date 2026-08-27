import { BaseHttpClient } from './http/base-client.js';
import { AccountNamespace } from './resources/account/index.js';
import { PublishingNamespace } from './resources/publishing/index.js';
import { AnalyticsNamespace } from './resources/analytics/index.js';
import { InboxNamespace } from './resources/inbox/index.js';
import { MediaNamespace } from './resources/media/index.js';
import { AdvocacyNamespace } from './resources/advocacy/index.js';
import { ApprovalsNamespace } from './resources/approvals/index.js';
import { StreamsNamespace } from './resources/streams/index.js';
import { LeadsNamespace } from './resources/leads/index.js';
import { EventsNamespace } from './resources/events/index.js';
import type { MeResponse, OktopostRequestInfo, OktopostResponseInfo } from './types/common.js';

export interface OktopostConfig {
  accountId: string;
  apiKey: string;
  region?: 'us' | 'eu';
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  fetch?: typeof globalThis.fetch;
  onRequest?: (info: OktopostRequestInfo) => void;
  onResponse?: (info: OktopostResponseInfo) => void;
}

const BASE_URLS: Record<string, string> = {
  us: 'https://api.oktopost.com/v2',
  eu: 'https://eu-api.oktopost.com/v2',
};

export class Oktopost {
  private readonly httpClient: BaseHttpClient;
  readonly account: AccountNamespace;
  readonly publishing: PublishingNamespace;
  readonly analytics: AnalyticsNamespace;
  readonly inbox: InboxNamespace;
  readonly media: MediaNamespace;
  readonly advocacy: AdvocacyNamespace;
  readonly approvals: ApprovalsNamespace;
  readonly streams: StreamsNamespace;
  readonly leads: LeadsNamespace;
  readonly events: EventsNamespace;

  constructor(config: OktopostConfig) {
    if (!config.accountId) {
      throw new Error('accountId is required');
    }
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }

    const baseUrl = config.baseUrl ?? BASE_URLS[config.region ?? 'us'];

    this.httpClient = new BaseHttpClient({
      baseUrl,
      accountId: config.accountId,
      apiKey: config.apiKey,
      timeout: config.timeout ?? 30_000,
      maxRetries: config.maxRetries ?? 3,
      fetch: config.fetch,
      onRequest: config.onRequest,
      onResponse: config.onResponse,
    });

    this.account = new AccountNamespace(this.httpClient);
    this.media = new MediaNamespace(this.httpClient);
    this.publishing = new PublishingNamespace(this.httpClient, {
      media: this.media.media,
      uploads: this.media.uploads,
    });
    this.analytics = new AnalyticsNamespace(this.httpClient);
    this.inbox = new InboxNamespace(this.httpClient);
    this.advocacy = new AdvocacyNamespace(this.httpClient);
    this.approvals = new ApprovalsNamespace(this.httpClient);
    this.streams = new StreamsNamespace(this.httpClient);
    this.leads = new LeadsNamespace(this.httpClient);
    this.events = new EventsNamespace(this.httpClient);
  }

  async me(): Promise<MeResponse> {
    return this.httpClient.get<MeResponse>('/me');
  }

  getHttpClient(): BaseHttpClient {
    return this.httpClient;
  }
}
