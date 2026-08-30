import { describe, it, expect } from 'vitest';
import { InboxNamespace } from '../../../../src/resources/inbox/index.js';
import { CommentsResource } from '../../../../src/resources/inbox/comments.js';
import { ConversationsResource } from '../../../../src/resources/inbox/conversations.js';
import { ConversationTagsResource } from '../../../../src/resources/inbox/conversation-tags.js';
import { CannedResponsesResource } from '../../../../src/resources/inbox/canned-responses.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('InboxNamespace', () => {
  it('exposes comments resource', () => {
    const http = createMockHttpClient();
    const inbox = new InboxNamespace(http);

    expect(inbox.comments).toBeInstanceOf(CommentsResource);
  });

  it('exposes conversations resource', () => {
    const http = createMockHttpClient();
    const inbox = new InboxNamespace(http);

    expect(inbox.conversations).toBeInstanceOf(ConversationsResource);
  });

  it('exposes conversationTags resource', () => {
    const http = createMockHttpClient();
    const inbox = new InboxNamespace(http);

    expect(inbox.conversationTags).toBeInstanceOf(ConversationTagsResource);
  });

  it('exposes cannedResponses resource', () => {
    const http = createMockHttpClient();
    const inbox = new InboxNamespace(http);

    expect(inbox.cannedResponses).toBeInstanceOf(CannedResponsesResource);
  });
});
