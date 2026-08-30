import { describe, it, expect } from 'vitest';
import { PostsResource } from '../../../../src/resources/publishing/posts.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('PostsResource', () => {
  it('get calls GET /post/{id} and returns Post', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004001', Status: 'pending' };
    (http.get as any).mockResolvedValue({ Result: true, Post: mockPost });

    const result = await posts.get('004001');

    expect(http.get).toHaveBeenCalledWith('/post/004001', undefined);
    expect(result).toEqual(mockPost);
  });

  it('get merges Stats into Post when stats=1', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004001', Status: 'complete' };
    const mockStats = { LinkClicks: 10, Conversions: 2, Comments: 5, Likes: 20, Shares: 3, ImpressionsAdded: 100 };
    (http.get as any).mockResolvedValue({ Result: true, Post: mockPost, Stats: mockStats });

    const result = await posts.get('004001', { stats: 1 });

    expect(http.get).toHaveBeenCalledWith('/post/004001', { stats: 1 });
    expect(result.Stats).toEqual(mockStats);
    expect(result.Id).toBe('004001');
  });

  it('list calls GET /post with params', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockResponse = { Result: true, Items: [{ Id: '004001' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await posts.list({ campaignId: '002abc', status: 'pending' });

    expect(http.get).toHaveBeenCalledWith('/post', { campaignId: '002abc', status: 'pending' });
    expect(result).toEqual(mockResponse);
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ Id: '1' }],
      Total: 1,
    });

    const items = [];
    for await (const item of posts.listAll({ campaignId: '002abc' })) {
      items.push(item);
    }

    expect(items).toHaveLength(1);
  });

  it('create calls POST /post', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004002', Status: 'pending' };
    (http.post as any).mockResolvedValue({ Result: true, Post: mockPost });

    const params = { messageId: 'msg1', credentialIds: 'cred1,cred2' };
    const result = await posts.create(params);

    expect(http.post).toHaveBeenCalledWith('/post', params);
    expect(result).toEqual(mockPost);
  });

  it('update calls POST /post/{id}', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004001', Status: 'draft' };
    (http.post as any).mockResolvedValue({ Result: true, Post: mockPost });

    const result = await posts.update('004001', { status: 'draft' });

    expect(http.post).toHaveBeenCalledWith('/post/004001', { status: 'draft' });
    expect(result).toEqual(mockPost);
  });

  it('create passes firstComment, targetingPresetId, and workflowId', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004003', Status: 'draft' };
    (http.post as any).mockResolvedValue({ Result: true, Post: mockPost });

    const params = {
      messageId: 'msg1',
      credentialIds: 'cred1',
      firstComment: { text: 'Nice post' },
      targetingPresetId: 'tp1',
      workflowId: 'wf1',
    };
    const result = await posts.create(params);

    expect(http.post).toHaveBeenCalledWith('/post', params);
    expect(result).toEqual(mockPost);
  });

  it('changeCampaign calls POST /post/{id}/change-campaign and returns Post', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    const mockPost = { Id: '004001', CampaignId: '002new' };
    (http.post as any).mockResolvedValue({ Result: true, Post: mockPost });

    const result = await posts.changeCampaign('004001', { campaignId: '002new' });

    expect(http.post).toHaveBeenCalledWith('/post/004001/change-campaign', {
      campaignId: '002new',
    });
    expect(result).toEqual(mockPost);
  });

  it('delete calls DELETE /post/{id}', async () => {
    const http = createMockHttpClient();
    const posts = new PostsResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await posts.delete('004001');

    expect(http.delete).toHaveBeenCalledWith('/post/004001');
    expect(result.Result).toBe(true);
  });
});
