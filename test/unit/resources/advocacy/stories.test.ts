import { describe, it, expect } from 'vitest';
import { StoriesResource } from '../../../../src/resources/advocacy/stories.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('StoriesResource', () => {
  it('get calls GET /story/{id} and returns Item', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    const mockStory = { ID: 's1', Title: 'Test Story' };
    (http.get as any).mockResolvedValue({ Result: true, Item: mockStory });

    const result = await stories.get('s1');

    expect(http.get).toHaveBeenCalledWith('/story/s1');
    expect(result).toEqual(mockStory);
  });

  it('list calls GET /story with params', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    const mockResponse = { Result: true, Items: [{ ID: 's1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await stories.list({ boardId: 'b1' });

    expect(http.get).toHaveBeenCalledWith('/story', { boardId: 'b1' });
    expect(result).toEqual(mockResponse);
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ ID: 's1' }, { ID: 's2' }],
      Total: 2,
    });

    const items = [];
    for await (const item of stories.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
  });

  it('create calls POST /story', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const params = { title: 'New Story', description: 'Desc', campaignId: 'c1' };
    const result = await stories.create(params);

    expect(http.post).toHaveBeenCalledWith('/story', params);
    expect(result.Result).toBe(true);
  });

  it('create forwards postlogId for repost stories', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const params = { boardId: 'b1', title: 'Repost', description: 'Desc', campaignId: 'c1', postlogId: '007x' };
    await stories.create(params);

    expect(http.post).toHaveBeenCalledWith('/story', params);
  });

  it('update calls POST /story/{id}', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    (http.post as any).mockResolvedValue({ Result: true });

    const result = await stories.update('s1', { title: 'Updated' });

    expect(http.post).toHaveBeenCalledWith('/story/s1', { title: 'Updated' });
    expect(result.Result).toBe(true);
  });

  it('delete calls DELETE /story/{id}', async () => {
    const http = createMockHttpClient();
    const stories = new StoriesResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await stories.delete('s1');

    expect(http.delete).toHaveBeenCalledWith('/story/s1');
    expect(result.Result).toBe(true);
  });
});
