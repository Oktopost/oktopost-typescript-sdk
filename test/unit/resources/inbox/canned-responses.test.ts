import { describe, it, expect } from 'vitest';
import { CannedResponsesResource } from '../../../../src/resources/inbox/canned-responses.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('CannedResponsesResource', () => {
  it('list calls GET /canned-response and returns the paginated response', async () => {
    const http = createMockHttpClient();
    const canned = new CannedResponsesResource(http);
    const response = {
      Result: true,
      Items: [{ ID: 'cnr1', Name: 'Welcome Reply' }],
      Total: 1,
    };
    (http.get as any).mockResolvedValue(response);

    const result = await canned.list({ q: 'Welcome' });

    expect(http.get).toHaveBeenCalledWith('/canned-response', { q: 'Welcome' });
    expect(result).toEqual(response);
  });

  it('listAll paginates through /canned-response', async () => {
    const http = createMockHttpClient();
    const canned = new CannedResponsesResource(http);
    (http.get as any).mockResolvedValue({
      Result: true,
      Items: [{ ID: 'cnr1', Name: 'Welcome Reply' }],
      Total: 1,
    });

    const collected = [];
    for await (const item of canned.listAll()) {
      collected.push(item);
    }

    expect(http.get).toHaveBeenCalledWith('/canned-response', { _page: 0, _count: 100 });
    expect(collected).toEqual([{ ID: 'cnr1', Name: 'Welcome Reply' }]);
  });

  it('get calls GET /canned-response/:id and returns CannedResponse', async () => {
    const http = createMockHttpClient();
    const canned = new CannedResponsesResource(http);
    const cannedResponse = { ID: 'cnr1', Name: 'Welcome Reply', Visibility: 'shared' };
    (http.get as any).mockResolvedValue({ Result: true, CannedResponse: cannedResponse });

    const result = await canned.get('cnr1');

    expect(http.get).toHaveBeenCalledWith('/canned-response/cnr1');
    expect(result).toEqual(cannedResponse);
  });

  it('create calls POST /canned-response and returns CannedResponse', async () => {
    const http = createMockHttpClient();
    const canned = new CannedResponsesResource(http);
    const cannedResponse = { ID: 'cnr3', Name: 'Pricing Inquiry', Visibility: 'shared' };
    (http.post as any).mockResolvedValue({ Result: true, CannedResponse: cannedResponse });

    const result = await canned.create({
      name: 'Pricing Inquiry',
      content: 'Thanks for your interest!',
      visibility: 'shared',
    });

    expect(http.post).toHaveBeenCalledWith('/canned-response', {
      name: 'Pricing Inquiry',
      content: 'Thanks for your interest!',
      visibility: 'shared',
    });
    expect(result).toEqual(cannedResponse);
  });
});
