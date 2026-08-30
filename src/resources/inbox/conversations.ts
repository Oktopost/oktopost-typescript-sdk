import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  AssignConversationParams,
  Conversation,
  ConversationAssignment,
  ConversationListParams,
  ConversationListResponse,
  ConversationStatus,
  ConversationTagRef,
  ConversationTimelineEntry,
  ConversationTimelineParams,
  CreateSalesforceCaseParams,
  ReplyConversationParams,
} from '../../types/inbox.js';

export class ConversationsResource extends BaseResource {
  async list(params?: ConversationListParams): Promise<ConversationListResponse> {
    const response = await this.httpClient.get<
      BaseApiResponse & { Conversations: { Total: number; Items: Conversation[] } }
    >('/conversation', params);
    return {
      Items: response.Conversations.Items,
      Total: response.Conversations.Total,
    };
  }

  async get(id: string): Promise<Conversation> {
    const response = await this.httpClient.get<SingleApiResponse<'Conversation', Conversation>>(
      `/conversation/${id}`,
    );
    return response.Conversation;
  }

  async updateStatus(id: string, status: ConversationStatus): Promise<BaseApiResponse> {
    return this.httpClient.post<BaseApiResponse>(`/conversation/${id}`, { status });
  }

  async getTimeline(
    id: string,
    params?: ConversationTimelineParams,
  ): Promise<ConversationTimelineEntry[]> {
    const response = await this.httpClient.get<
      SingleApiResponse<'Timeline', ConversationTimelineEntry[]>
    >(`/conversation/${id}/timeline`, params);
    return response.Timeline;
  }

  async assign(id: string, params: AssignConversationParams): Promise<ConversationAssignment> {
    const response = await this.httpClient.post<
      SingleApiResponse<'Assignment', ConversationAssignment>
    >(`/conversation/${id}/assign`, params);
    return response.Assignment;
  }

  async addNote(id: string, note: string): Promise<ConversationTimelineEntry> {
    const response = await this.httpClient.post<
      SingleApiResponse<'Note', ConversationTimelineEntry>
    >(`/conversation/${id}/note`, { note });
    return response.Note;
  }

  async updateTags(id: string, tags: string[]): Promise<ConversationTagRef[]> {
    const response = await this.httpClient.post<SingleApiResponse<'Tags', ConversationTagRef[]>>(
      `/conversation/${id}/tag`,
      { tags },
    );
    return response.Tags;
  }

  async reply(id: string, params: ReplyConversationParams): Promise<BaseApiResponse> {
    return this.httpClient.post<BaseApiResponse>(`/conversation/${id}/reply`, params);
  }

  async createSalesforceCase(
    id: string,
    params: CreateSalesforceCaseParams,
  ): Promise<BaseApiResponse> {
    return this.httpClient.post<BaseApiResponse>(`/conversation/${id}/create-case`, params);
  }
}
