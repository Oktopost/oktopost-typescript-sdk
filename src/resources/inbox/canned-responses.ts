import { BaseResource } from '../base-resource.js';
import type { PaginatedApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  CannedResponse,
  CannedResponseListParams,
  CreateCannedResponseParams,
} from '../../types/inbox.js';

export class CannedResponsesResource extends BaseResource {
  async list(params?: CannedResponseListParams): Promise<PaginatedApiResponse<CannedResponse>> {
    return this.httpClient.get<PaginatedApiResponse<CannedResponse>>('/canned-response', params);
  }

  async *listAll(
    params?: Omit<CannedResponseListParams, '_page' | '_count'>,
  ): AsyncGenerator<CannedResponse, void, undefined> {
    yield* this.autoPaginate<CannedResponse>('/canned-response', params);
  }

  async get(id: string): Promise<CannedResponse> {
    const response = await this.httpClient.get<
      SingleApiResponse<'CannedResponse', CannedResponse>
    >(`/canned-response/${id}`);
    return response.CannedResponse;
  }

  async create(params: CreateCannedResponseParams): Promise<CannedResponse> {
    const response = await this.httpClient.post<
      SingleApiResponse<'CannedResponse', CannedResponse>
    >('/canned-response', params);
    return response.CannedResponse;
  }
}
