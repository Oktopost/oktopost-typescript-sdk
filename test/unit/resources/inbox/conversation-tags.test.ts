import { describe, it, expect } from 'vitest';
import { ConversationTagsResource } from '../../../../src/resources/inbox/conversation-tags.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('ConversationTagsResource', () => {
  it('list calls GET /conversation-tag and returns the paginated response', async () => {
    const http = createMockHttpClient();
    const tags = new ConversationTagsResource(http);
    const response = {
      Result: true,
      Items: [{ Id: 'etg1', Value: 'Support' }],
      Total: 1,
    };
    (http.get as any).mockResolvedValue(response);

    const result = await tags.list({ q: 'Sup' });

    expect(http.get).toHaveBeenCalledWith('/conversation-tag', { q: 'Sup' });
    expect(result).toEqual(response);
  });

  it('listAll paginates through /conversation-tag', async () => {
    const http = createMockHttpClient();
    const tags = new ConversationTagsResource(http);
    (http.get as any).mockResolvedValue({
      Result: true,
      Items: [{ Id: 'etg1', Value: 'Support' }],
      Total: 1,
    });

    const collected = [];
    for await (const tag of tags.listAll()) {
      collected.push(tag);
    }

    expect(http.get).toHaveBeenCalledWith('/conversation-tag', { _page: 0, _count: 100 });
    expect(collected).toEqual([{ Id: 'etg1', Value: 'Support' }]);
  });

  it('get calls GET /conversation-tag/:id and returns Tag', async () => {
    const http = createMockHttpClient();
    const tags = new ConversationTagsResource(http);
    const tag = { Id: 'etg1', Value: 'Support' };
    (http.get as any).mockResolvedValue({ Result: true, Tag: tag });

    const result = await tags.get('etg1');

    expect(http.get).toHaveBeenCalledWith('/conversation-tag/etg1');
    expect(result).toEqual(tag);
  });

  it('update calls POST /conversation-tag/:id and returns BaseApiResponse', async () => {
    const http = createMockHttpClient();
    const tags = new ConversationTagsResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const result = await tags.update('etg1', { tag: 'Customer Support' });

    expect(http.post).toHaveBeenCalledWith('/conversation-tag/etg1', { tag: 'Customer Support' });
    expect(result).toEqual({ Result: true });
  });

  it('delete calls DELETE /conversation-tag/:id', async () => {
    const http = createMockHttpClient();
    const tags = new ConversationTagsResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await tags.delete('etg1');

    expect(http.delete).toHaveBeenCalledWith('/conversation-tag/etg1');
    expect(result).toEqual({ Result: true });
  });
});
