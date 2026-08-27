import { createHmac, timingSafeEqual } from 'node:crypto';

export type WebhookEventType =
  | 'newAdvocacyMessage'
  | 'newAdvocacyStory'
  | 'newAdvocacyTopic'
  | 'postCreated'
  | 'postModified'
  | 'postDeleted'
  | 'postSent'
  | 'newInboxItem'
  | 'newCommentOnInboxItem'
  | 'newDirectMessageOnInboxItem'
  | 'inboxItemReplied'
  | 'newNoteOnInboxItem'
  | 'newInboxItemAssignment'
  | 'inboxItemStatusChange'
  | 'inboxItemTagChange'
  | 'newConversation'
  | 'conversationUpdated'
  | 'conversationStatusUpdated'
  | 'newNoteOnConversation'
  | 'newAssignment'
  | 'newLead'
  | 'newLeadActivity'
  | 'newConversion'
  | 'newApprovalItem'
  | 'approvalItemApproved'
  | 'approvalItemRejected'
  | 'newCampaign';

export interface WebhookEvent<T = unknown> {
  event: WebhookEventType;
  timestamp: number;
  webhookId: string;
  data: T;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
): boolean {
  const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf-8');

  const expectedSignature = createHmac('sha1', secret).update(payloadStr).digest('hex');

  const expected = Buffer.from(expectedSignature.toLowerCase(), 'utf-8');
  const actual = Buffer.from(signature.toLowerCase(), 'utf-8');

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function constructEvent<T = unknown>(
  rawBody: string | Buffer,
  signature: string,
  secret: string,
): WebhookEvent<T> {
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    throw new Error('Invalid webhook signature');
  }

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  return JSON.parse(body) as WebhookEvent<T>;
}
