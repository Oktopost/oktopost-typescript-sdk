import { describe, it, expect } from 'vitest';
import { DashboardsResource } from '../../../../src/resources/analytics/dashboards.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('DashboardsResource', () => {
  it('list calls GET /dashboard with params and returns envelope with TotalUnfiltered', async () => {
    const http = createMockHttpClient();
    const dashboards = new DashboardsResource(http);
    const mockResponse = {
      Result: true,
      Items: [{ Id: 'a1b2c3d4e5', Name: 'Monthly Overview' }],
      Total: 12,
      TotalUnfiltered: 24,
    };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await dashboards.list({ search: 'monthly', visibility: 'shared', _count: 50 });

    expect(http.get).toHaveBeenCalledWith('/dashboard', {
      search: 'monthly',
      visibility: 'shared',
      _count: 50,
    });
    expect(result).toEqual(mockResponse);
    expect(result.TotalUnfiltered).toBe(24);
  });

  it('listAll yields all items across pages', async () => {
    const http = createMockHttpClient();
    const dashboards = new DashboardsResource(http);
    (http.get as any)
      .mockResolvedValueOnce({
        Result: true,
        Items: Array.from({ length: 100 }, (_, i) => ({ Id: `d${i}` })),
        Total: 150,
      })
      .mockResolvedValueOnce({
        Result: true,
        Items: Array.from({ length: 50 }, (_, i) => ({ Id: `d${100 + i}` })),
        Total: 150,
      });

    const items = [];
    for await (const item of dashboards.listAll({ visibility: 'shared' })) {
      items.push(item);
    }

    expect(items).toHaveLength(150);
    expect(http.get).toHaveBeenCalledTimes(2);
    expect((http.get as any).mock.calls[0][1]).toEqual(
      expect.objectContaining({ _count: 100 }),
    );
  });

  it('get calls GET /dashboard/:id and unwraps Dashboard', async () => {
    const http = createMockHttpClient();
    const dashboards = new DashboardsResource(http);
    const dashboard = {
      Id: 'a1b2c3d4e5',
      Name: 'Monthly Overview',
      Type: 'custom',
      Visibility: 'shared',
      Widgets: [{ Id: 'w1x2y3z4', Type: 'report', Name: 'Post Engagement' }],
      Teams: [],
    };
    (http.get as any).mockResolvedValue({ Result: true, Dashboard: dashboard });

    const result = await dashboards.get('a1b2c3d4e5');

    expect(http.get).toHaveBeenCalledWith('/dashboard/a1b2c3d4e5');
    expect(result).toEqual(dashboard);
  });

  it('getReportData calls GET /dashboard/:id/report with widget id query', async () => {
    const http = createMockHttpClient();
    const dashboards = new DashboardsResource(http);
    const mockResponse = {
      Result: true,
      Data: [{ Network: 'LinkedIn', Impressions: 15200 }],
      Entities: {},
    };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await dashboards.getReportData('a1b2c3d4e5', { id: 'w1x2y3z4' });

    expect(http.get).toHaveBeenCalledWith('/dashboard/a1b2c3d4e5/report', { id: 'w1x2y3z4' });
    expect(result).toEqual(mockResponse);
  });

  it('getReportData passes optional filter param', async () => {
    const http = createMockHttpClient();
    const dashboards = new DashboardsResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Data: [], Entities: {} });

    await dashboards.getReportData('a1b2c3d4e5', {
      id: 'w1x2y3z4',
      filter: { network: 'LinkedIn' },
    });

    expect(http.get).toHaveBeenCalledWith('/dashboard/a1b2c3d4e5/report', {
      id: 'w1x2y3z4',
      filter: { network: 'LinkedIn' },
    });
  });
});
