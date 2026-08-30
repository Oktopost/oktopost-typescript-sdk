import { describe, it, expect } from 'vitest';
import { ConversationsResource } from '../../../../src/resources/inbox/conversations.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('ConversationsResource', () => {
  it('list calls GET /conversation and unwraps the nested envelope', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const items = [{ Id: 'eit1', Status: 'open', ItemType: 'Post' }];
    (http.get as any).mockResolvedValue({
      Result: true,
      Conversations: { Total: 42, Items: items },
    });

    const result = await conversations.list({ status: 'open', type: 'Post,Mention', _count: 50 });

    expect(http.get).toHaveBeenCalledWith('/conversation', {
      status: 'open',
      type: 'Post,Mention',
      _count: 50,
    });
    expect(result).toEqual({ Items: items, Total: 42 });
  });

  it('list works without params', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    (http.get as any).mockResolvedValue({
      Result: true,
      Conversations: { Total: 0, Items: [] },
    });

    const result = await conversations.list();

    expect(http.get).toHaveBeenCalledWith('/conversation', undefined);
    expect(result).toEqual({ Items: [], Total: 0 });
  });

  it('get calls GET /conversation/:id and returns Conversation', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const conversation = { Id: 'eit1', Tags: [{ Id: 'etg1', Name: 'Support' }] };
    (http.get as any).mockResolvedValue({ Result: true, Conversation: conversation });

    const result = await conversations.get('eit1');

    expect(http.get).toHaveBeenCalledWith('/conversation/eit1');
    expect(result).toEqual(conversation);
  });

  it('updateStatus calls POST /conversation/:id with status', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const result = await conversations.updateStatus('eit1', 'closed');

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1', { status: 'closed' });
    expect(result).toEqual({ Result: true });
  });

  it('getTimeline calls GET /conversation/:id/timeline and returns Timeline', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const timeline = [{ Id: 'eat1', Type: 'note', Content: 'hi' }];
    (http.get as any).mockResolvedValue({ Result: true, Timeline: timeline });

    const result = await conversations.getTimeline('eit1', { last_loaded_id: 'eat9' });

    expect(http.get).toHaveBeenCalledWith('/conversation/eit1/timeline', {
      last_loaded_id: 'eat9',
    });
    expect(result).toEqual(timeline);
  });

  it('assign calls POST /conversation/:id/assign and returns Assignment', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const assignment = { ItemId: 'eit1', AssigneeId: '00A2' };
    (http.post as any).mockResolvedValue({ Result: true, Assignment: assignment });

    const result = await conversations.assign('eit1', {
      assignee_id: '00A2',
      note: 'VIP',
    });

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1/assign', {
      assignee_id: '00A2',
      note: 'VIP',
    });
    expect(result).toEqual(assignment);
  });

  it('addNote calls POST /conversation/:id/note and returns Note', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const note = { Id: 'eat3', Type: 'note', Content: 'Escalated' };
    (http.post as any).mockResolvedValue({ Result: true, Note: note });

    const result = await conversations.addNote('eit1', 'Escalated');

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1/note', { note: 'Escalated' });
    expect(result).toEqual(note);
  });

  it('updateTags calls POST /conversation/:id/tag and returns Tags', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    const tags = [
      { Id: 'etg1', Name: 'Support' },
      { Id: 'etg2', Name: 'VIP' },
    ];
    (http.post as any).mockResolvedValue({ Result: true, Tags: tags });

    const result = await conversations.updateTags('eit1', ['Support', 'VIP']);

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1/tag', {
      tags: ['Support', 'VIP'],
    });
    expect(result).toEqual(tags);
  });

  it('reply calls POST /conversation/:id/reply', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const result = await conversations.reply('eit1', {
      message: 'Thanks!',
      parent_comment_id: 'eit3',
    });

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1/reply', {
      message: 'Thanks!',
      parent_comment_id: 'eit3',
    });
    expect(result).toEqual({ Result: true });
  });

  it('createSalesforceCase calls POST /conversation/:id/create-case', async () => {
    const http = createMockHttpClient();
    const conversations = new ConversationsResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const result = await conversations.createSalesforceCase('eit1', {
      integration_id: 'sfint1',
      case_owner: '005',
    });

    expect(http.post).toHaveBeenCalledWith('/conversation/eit1/create-case', {
      integration_id: 'sfint1',
      case_owner: '005',
    });
    expect(result).toEqual({ Result: true });
  });
});
