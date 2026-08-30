import { describe, it, expect } from 'vitest';
import {
  CalendarResource,
  CalendarCustomEventsResource,
} from '../../../../src/resources/publishing/calendar.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('CalendarResource', () => {
  it('get calls POST /calendar with params', async () => {
    const http = createMockHttpClient();
    const calendar = new CalendarResource(http);
    const mockResponse = {
      Result: true,
      Campaigns: { '002abc': { Color: '#ff0000', Id: '002abc', Name: 'Test', Status: 'active' } },
      Credentials: {},
      Media: [],
      Messages: {},
      Posts: {},
      CustomEvents: [],
    };
    (http.post as any).mockResolvedValue(mockResponse);

    const params = { fromDate: '2024-01-01', toDate: '2024-01-31' };
    const result = await calendar.get(params);

    expect(http.post).toHaveBeenCalledWith('/calendar', {
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
    });
    const callArg = (http.post as any).mock.calls[0][1];
    expect('filters' in callArg).toBe(false);
    expect(result).toEqual(mockResponse);
  });

  it('get passes filters', async () => {
    const http = createMockHttpClient();
    const calendar = new CalendarResource(http);
    (http.post as any).mockResolvedValue({ Result: true, Campaigns: {}, Credentials: {}, Media: [], Messages: {}, Posts: {}, CustomEvents: [] });

    const filters = { campaigns: ['002abc'], networks: ['Twitter'] };
    const params = {
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
      filters,
    };
    await calendar.get(params);

    const callArg = (http.post as any).mock.calls[0][1];
    expect(callArg.fromDate).toBe('2024-01-01');
    expect(callArg.toDate).toBe('2024-01-31');
    expect(typeof callArg.filters).toBe('string');
    expect(JSON.parse(callArg.filters)).toEqual(filters);
  });

  it('exposes a customEvents sub-resource', () => {
    const http = createMockHttpClient();
    const calendar = new CalendarResource(http);
    expect(calendar.customEvents).toBeInstanceOf(CalendarCustomEventsResource);
  });
});

describe('CalendarCustomEventsResource', () => {
  it('list calls GET /calendar/custom-events with params', async () => {
    const http = createMockHttpClient();
    const events = new CalendarCustomEventsResource(http);
    const mockResponse = { Result: true, Items: [{ ID: '0CE1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const params = { campaignIds: ['002abc'], after: 1785542400 };
    const result = await events.list(params);

    expect(http.get).toHaveBeenCalledWith('/calendar/custom-events', params);
    expect(result).toEqual(mockResponse);
  });

  it('get calls GET /calendar/custom-events?id= and returns Item', async () => {
    const http = createMockHttpClient();
    const events = new CalendarCustomEventsResource(http);
    const mockEvent = { ID: '0CE1', Title: 'Launch' };
    (http.get as any).mockResolvedValue({ Result: true, Item: mockEvent });

    const result = await events.get('0CE1');

    expect(http.get).toHaveBeenCalledWith('/calendar/custom-events', { id: '0CE1' });
    expect(result).toEqual(mockEvent);
  });

  it('create calls POST /calendar/custom-events and returns Item', async () => {
    const http = createMockHttpClient();
    const events = new CalendarCustomEventsResource(http);
    const mockEvent = { ID: '0CE2', Title: 'Launch' };
    (http.post as any).mockResolvedValue({ Result: true, Item: mockEvent });

    const params = { title: 'Launch', startDate: 1786352400 };
    const result = await events.create(params);

    expect(http.post).toHaveBeenCalledWith('/calendar/custom-events', params);
    expect(result).toEqual(mockEvent);
  });

  it('update calls PUT /calendar/custom-events with id in body and returns Item', async () => {
    const http = createMockHttpClient();
    const events = new CalendarCustomEventsResource(http);
    const mockEvent = { ID: '0CE1', Title: 'Updated' };
    (http.put as any).mockResolvedValue({ Result: true, Item: mockEvent });

    const params = { id: '0CE1', title: 'Updated' };
    const result = await events.update(params);

    expect(http.put).toHaveBeenCalledWith('/calendar/custom-events', params);
    expect(result).toEqual(mockEvent);
  });

  it('delete calls DELETE /calendar/custom-events with id in body', async () => {
    const http = createMockHttpClient();
    const events = new CalendarCustomEventsResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await events.delete('0CE1');

    expect(http.delete).toHaveBeenCalledWith('/calendar/custom-events', { id: '0CE1' });
    expect(result.Result).toBe(true);
  });
});
