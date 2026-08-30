import { BaseResource } from '../base-resource.js';
import type {
  BaseApiResponse,
  PaginatedApiResponse,
  SingleApiResponse,
} from '../../types/common.js';
import type {
  ConversationTag,
  ConversationTagListParams,
  UpdateConversationTagParams,
} from '../../types/inbox.js';

export class ConversationTagsResource extends BaseResource {
  async list(params?: ConversationTagListParams): Promise<PaginatedApiResponse<ConversationTag>> {
    return this.httpClient.get<PaginatedApiResponse<ConversationTag>>('/conversation-tag', params);
  }

  async *listAll(
    params?: Omit<ConversationTagListParams, '_page' | '_count'>,
  ): AsyncGenerator<ConversationTag, void, undefined> {
    yield* this.autoPaginate<ConversationTag>('/conversation-tag', params);
  }

  async get(id: string): Promise<ConversationTag> {
    const response = await this.httpClient.get<SingleApiResponse<'Tag', ConversationTag>>(
      `/conversation-tag/${id}`,
    );
    return response.Tag;
  }

  async update(id: string, params: UpdateConversationTagParams): Promise<BaseApiResponse> {
    return this.httpClient.post<BaseApiResponse>(`/conversation-tag/${id}`, params);
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/conversation-tag/${id}`);
  }
}
