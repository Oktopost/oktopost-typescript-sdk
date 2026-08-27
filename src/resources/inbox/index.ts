import type { BaseHttpClient } from '../../http/base-client.js';
import { CommentsResource } from './comments.js';
import { ConversationsResource } from './conversations.js';
import { ConversationTagsResource } from './conversation-tags.js';
import { CannedResponsesResource } from './canned-responses.js';

export class InboxNamespace {
  readonly comments: CommentsResource;
  readonly conversations: ConversationsResource;
  readonly conversationTags: ConversationTagsResource;
  readonly cannedResponses: CannedResponsesResource;

  constructor(httpClient: BaseHttpClient) {
    this.comments = new CommentsResource(httpClient);
    this.conversations = new ConversationsResource(httpClient);
    this.conversationTags = new ConversationTagsResource(httpClient);
    this.cannedResponses = new CannedResponsesResource(httpClient);
  }
}

export { CommentsResource } from './comments.js';
export { ConversationsResource } from './conversations.js';
export { ConversationTagsResource } from './conversation-tags.js';
export { CannedResponsesResource } from './canned-responses.js';
