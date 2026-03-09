import { describe, it, expect } from 'vitest';
import { WebhookConfigsResource } from '../../../../src/resources/events/webhooks.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('WebhookConfigsResource', () => {
  it('get calls GET /webhook/{id}', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockWebhook = { Id: 'wh1', Name: 'My Webhook' };
    (http.get as any).mockResolvedValue({ Result: true, Webhook: mockWebhook });

    const result = await webhooks.get('wh1');

    expect(http.get).toHaveBeenCalledWith('/webhook/wh1');
    expect(result).toEqual(mockWebhook);
  });

  it('list calls GET /webhook with params', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockResponse = { Result: true, Items: [{ Id: 'wh1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await webhooks.list({ event: 'postCreated' });

    expect(http.get).toHaveBeenCalledWith('/webhook', { event: 'postCreated' });
    expect(result).toEqual(mockResponse);
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ Id: 'wh1' }, { Id: 'wh2' }],
      Total: 2,
    });

    const items = [];
    for await (const item of webhooks.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
  });

  it('create calls POST /webhook and returns Webhook', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockWebhook = { Id: 'wh1', Name: 'New', Secret: 'abc' };
    (http.post as any).mockResolvedValue({ Result: true, Webhook: mockWebhook });

    const params = { event: 'postCreated', name: 'New', url: 'https://example.com/hook' };
    const result = await webhooks.create(params);

    expect(http.post).toHaveBeenCalledWith('/webhook', params);
    expect(result).toEqual(mockWebhook);
  });

  it('create passes isHidden parameter', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockWebhook = { Id: 'wh1', Name: 'Hidden', IsHidden: 1 };
    (http.post as any).mockResolvedValue({ Result: true, Webhook: mockWebhook });

    const params = { event: 'postCreated', name: 'Hidden', url: 'https://example.com/hook', isHidden: 1 as const };
    const result = await webhooks.create(params);

    expect(http.post).toHaveBeenCalledWith('/webhook', params);
    expect(result).toEqual(mockWebhook);
  });

  it('update calls PUT /webhook/{id} and returns Webhook', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockWebhook = { Id: 'wh1', Name: 'Updated' };
    (http.put as any).mockResolvedValue({ Result: true, Webhook: mockWebhook });

    const result = await webhooks.update('wh1', { name: 'Updated' });

    expect(http.put).toHaveBeenCalledWith('/webhook/wh1', { name: 'Updated' });
    expect(result).toEqual(mockWebhook);
  });

  it('update passes isHidden parameter', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    const mockWebhook = { Id: 'wh1', Name: 'Updated', IsHidden: 1 };
    (http.put as any).mockResolvedValue({ Result: true, Webhook: mockWebhook });

    const result = await webhooks.update('wh1', { isHidden: 1 });

    expect(http.put).toHaveBeenCalledWith('/webhook/wh1', { isHidden: 1 });
    expect(result).toEqual(mockWebhook);
  });

  it('delete calls DELETE /webhook/{id}', async () => {
    const http = createMockHttpClient();
    const webhooks = new WebhookConfigsResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await webhooks.delete('wh1');

    expect(http.delete).toHaveBeenCalledWith('/webhook/wh1');
    expect(result.Result).toBe(true);
  });
});
