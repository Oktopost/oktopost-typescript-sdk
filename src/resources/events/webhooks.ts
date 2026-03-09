import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, PaginatedApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  WebhookConfig,
  WebhookConfigListParams,
  CreateWebhookConfigParams,
  UpdateWebhookConfigParams,
} from '../../types/events.js';

export class WebhookConfigsResource extends BaseResource {
  async get(id: string): Promise<WebhookConfig> {
    const response = await this.httpClient.get<SingleApiResponse<'Webhook', WebhookConfig>>(
      `/webhook/${id}`,
    );
    return response.Webhook;
  }

  async list(params?: WebhookConfigListParams): Promise<PaginatedApiResponse<WebhookConfig>> {
    return this.httpClient.get<PaginatedApiResponse<WebhookConfig>>(
      '/webhook',
      params,
    );
  }

  async *listAll(
    params?: Omit<WebhookConfigListParams, '_page' | '_count'>,
  ): AsyncGenerator<WebhookConfig, void, undefined> {
    yield* this.autoPaginate<WebhookConfig>(
      '/webhook',
      params,
    );
  }

  async create(params: CreateWebhookConfigParams): Promise<WebhookConfig> {
    const response = await this.httpClient.post<SingleApiResponse<'Webhook', WebhookConfig>>(
      '/webhook',
      params,
    );
    return response.Webhook;
  }

  async update(id: string, params: UpdateWebhookConfigParams): Promise<WebhookConfig> {
    const response = await this.httpClient.post<SingleApiResponse<'Webhook', WebhookConfig>>(
      `/webhook/${id}`,
      params,
    );
    return response.Webhook;
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/webhook/${id}`);
  }
}
