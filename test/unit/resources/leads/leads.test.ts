import { describe, it, expect } from 'vitest';
import { LeadsResource } from '../../../../src/resources/leads/leads.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('LeadsResource', () => {
  it('get calls GET /lead/{id}', async () => {
    const http = createMockHttpClient();
    const leads = new LeadsResource(http);
    const mockLead = { Id: 'l1', Name: 'John Doe' };
    (http.get as any).mockResolvedValue({ Result: true, Lead: mockLead });

    const result = await leads.get('l1');

    expect(http.get).toHaveBeenCalledWith('/lead/l1');
    expect(result).toEqual(mockLead);
  });

  it('list calls GET /lead with params', async () => {
    const http = createMockHttpClient();
    const leads = new LeadsResource(http);
    const mockResponse = { Result: true, Items: [{ Id: 'l1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await leads.list({ search: 'john' });

    expect(http.get).toHaveBeenCalledWith('/lead', { search: 'john' });
    expect(result).toEqual(mockResponse);
  });

  it('list forwards all_leads param', async () => {
    const http = createMockHttpClient();
    const leads = new LeadsResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Items: [], Total: 0 });

    await leads.list({ all_leads: true });

    expect(http.get).toHaveBeenCalledWith('/lead', { all_leads: true });
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const leads = new LeadsResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ Id: 'l1' }, { Id: 'l2' }],
      Total: 2,
    });

    const items = [];
    for await (const item of leads.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
  });

  it('delete calls DELETE /lead/{id}', async () => {
    const http = createMockHttpClient();
    const leads = new LeadsResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await leads.delete('l1');

    expect(http.delete).toHaveBeenCalledWith('/lead/l1');
    expect(result.Result).toBe(true);
  });
});
