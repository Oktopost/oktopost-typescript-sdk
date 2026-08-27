import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, PaginatedApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  Advocate,
  AdvocateListItem,
  AdvocateListParams,
  AdvocateGetParams,
  InviteAdvocateParams,
  InviteAdvocatesResponse,
  BulkInviteAdvocatesParams,
  BulkInviteAdvocatesResponse,
} from '../../types/advocacy.js';

export class AdvocatesResource extends BaseResource {
  async get(id: string, params?: AdvocateGetParams): Promise<Advocate> {
    const response = await this.httpClient.get<SingleApiResponse<'Advocate', Advocate>>(
      `/advocate/${id}`,
      params,
    );
    return response.Advocate;
  }

  async list(params?: AdvocateListParams): Promise<PaginatedApiResponse<AdvocateListItem>> {
    return this.httpClient.get<PaginatedApiResponse<AdvocateListItem>>(
      '/advocate',
      params,
    );
  }

  async *listAll(
    params?: Omit<AdvocateListParams, '_page' | '_count'>,
  ): AsyncGenerator<AdvocateListItem, void, undefined> {
    yield* this.autoPaginate<AdvocateListItem>(
      '/advocate',
      params,
    );
  }

  async invite(params: InviteAdvocateParams): Promise<InviteAdvocatesResponse> {
    return this.httpClient.post<InviteAdvocatesResponse>(
      '/advocate',
      params,
    );
  }

  async bulkInvite(params: BulkInviteAdvocatesParams): Promise<BulkInviteAdvocatesResponse> {
    return this.httpClient.post<BulkInviteAdvocatesResponse>(
      '/advocate/bulk',
      params,
    );
  }

  async delete(id: string, boardId: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/advocate/${id}`, { boardId });
  }
}
