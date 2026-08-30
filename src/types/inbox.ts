import type { PaginationParams } from './common.js';

export interface Comment {
  ProfileName: string;
  Date: string;
  CommentText: string;
  CommentId: string;
  ActivityId: string;
  Network: string;
  PostlogId: string;
}

export interface CommentListParams {
  postlogId?: string;
  network?: string;
}

export type ConversationItemType = 'Conversation' | 'Post' | 'Mention' | 'Reply';

export type ConversationStatus = 'open' | 'closed';

export interface ConversationTagRef {
  Id: string;
  Name: string;
}

export interface Conversation {
  Id: string;
  Created: string;
  Modified: string;
  Status: ConversationStatus;
  Network: string;
  ItemType: ConversationItemType;
  AssigneeId: string;
  ProfileName: string;
  Tags?: ConversationTagRef[];
}

export interface ConversationTimelineEntry {
  Id: string;
  Type: string;
  Created: string;
  Content: string;
  CreatedBy?: string;
}

export interface ConversationAssignment {
  ItemId: string;
  AssigneeId: string;
}

export interface ConversationListParams {
  type?: string;
  status?: string;
  network?: string;
  assignee_id?: string;
  tag?: string;
  q?: string;
  _count?: number;
}

export interface ConversationListResponse {
  Items: Conversation[];
  Total: number;
}

export interface ConversationTimelineParams {
  last_loaded_id?: string;
}

export interface AssignConversationParams {
  assignee_id: string;
  note?: string;
}

export interface ReplyConversationParams {
  message: string;
  credential_id?: string;
  parent_comment_id?: string;
  media?: unknown[];
}

export interface CreateSalesforceCaseParams {
  integration_id: string;
  case_owner?: string;
  contact_id?: string;
  case_description?: string;
}

export interface ConversationTag {
  Id: string;
  Value: string;
}

export interface ConversationTagListParams extends PaginationParams {
  q?: string;
}

export interface UpdateConversationTagParams {
  tag: string;
}

export type CannedResponseVisibility = 'shared' | 'private';

export interface CannedResponseAuthor {
  Id: string;
  Name: string;
  Email: string;
}

export interface CannedResponse {
  ID: string;
  Name: string;
  Content: string;
  Visibility: CannedResponseVisibility;
  Created: string;
  CreatedBy: CannedResponseAuthor;
}

export interface CannedResponseListParams extends PaginationParams {
  q?: string;
}

export interface CreateCannedResponseParams {
  name: string;
  content: string;
  visibility?: CannedResponseVisibility;
}
