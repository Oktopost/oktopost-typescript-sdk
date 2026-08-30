import { BaseHttpClient } from '../../../src/http/base-client.js';
import { CalendarCustomEventsResource, CalendarResource } from '../../../src/resources/publishing/calendar.js';
import { ConversationsResource } from '../../../src/resources/inbox/conversations.js';
import { AdvocatesResource } from '../../../src/resources/advocacy/advocates.js';
import { DashboardsResource } from '../../../src/resources/analytics/dashboards.js';
import { PostsResource } from '../../../src/resources/publishing/posts.js';

function createClientWithFetch() {
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ Result: true, Items: [], Total: 0, Item: {}, Post: {}, Tags: [], Users: [] }),
    headers: new Map(),
  });
  const client = new BaseHttpClient({
    baseUrl: 'https://api.oktopost.com/v2',
    accountId: 'testAccount',
    apiKey: 'testKey',
    timeout: 30_000,
    maxRetries: 0,
    fetch,
  });
  return { client, fetch };
}

function requestUrl(fetch: ReturnType<typeof vi.fn>): string {
  return decodeURIComponent(fetch.mock.calls[0][0] as string);
}

function requestBody(fetch: ReturnType<typeof vi.fn>): URLSearchParams {
  return new URLSearchParams((fetch.mock.calls[0][1] as RequestInit).body as string);
}

describe('bracket-notation encoding', () => {
  it('encodes array query params as key[]', async () => {
    const { client, fetch } = createClientWithFetch();
    const events = new CalendarCustomEventsResource(client);

    await events.list({ ids: ['a', 'b'] });

    const url = requestUrl(fetch);
    expect(url).toContain('ids[]=a');
    expect(url).toContain('ids[]=b');
  });

  it('encodes array body params as key[]', async () => {
    const { client, fetch } = createClientWithFetch();
    const events = new CalendarCustomEventsResource(client);

    await events.create({ title: 'Launch', startDate: 1, campaignIds: ['c1', 'c2'] });

    const body = requestBody(fetch);
    expect(body.getAll('campaignIds[]')).toEqual(['c1', 'c2']);
  });

  it('encodes scalar-array body params for updateTags', async () => {
    const { client, fetch } = createClientWithFetch();
    const conversations = new ConversationsResource(client);

    await conversations.updateTags('eit1', ['A', 'B']);

    const body = requestBody(fetch);
    expect(body.getAll('tags[]')).toEqual(['A', 'B']);
  });

  it('encodes array-of-objects body params for bulkInvite', async () => {
    const { client, fetch } = createClientWithFetch();
    const advocates = new AdvocatesResource(client);

    await advocates.bulkInvite({
      boardId: 'brd1',
      users: [{ email: 'user@oktopost.com', firstName: 'user', lastName: 'smith' }],
    });

    const body = requestBody(fetch);
    expect(body.get('boardId')).toBe('brd1');
    expect(body.get('users[0][email]')).toBe('user@oktopost.com');
    expect(body.get('users[0][firstName]')).toBe('user');
    expect(body.get('users[0][lastName]')).toBe('smith');
  });

  it('encodes nested-object query params for dashboard report filter', async () => {
    const { client, fetch } = createClientWithFetch();
    const dashboards = new DashboardsResource(client);

    await dashboards.getReportData('dash1', { id: 'w1', filter: { network: 'LinkedIn' } });

    const url = requestUrl(fetch);
    expect(url).toContain('id=w1');
    expect(url).toContain('filter[network]=LinkedIn');
  });

  it('encodes firstComment as a nested object on create', async () => {
    const { client, fetch } = createClientWithFetch();
    const posts = new PostsResource(client);

    await posts.create({
      messageId: '005',
      credentialIds: '003',
      firstComment: { text: 'Hello', media: '026' },
    });

    const body = requestBody(fetch);
    expect(body.get('firstComment[text]')).toBe('Hello');
    expect(body.get('firstComment[media]')).toBe('026');
  });

  it('encodes firstComment removal as firstComment=null on update', async () => {
    const { client, fetch } = createClientWithFetch();
    const posts = new PostsResource(client);

    await posts.update('004', { firstComment: null });

    const body = requestBody(fetch);
    expect(body.get('firstComment')).toBe('null');
  });

  it('encodes campaignIds[] on custom-event update', async () => {
    const { client, fetch } = createClientWithFetch();
    const events = new CalendarCustomEventsResource(client);

    await events.update({ id: '0CE1', campaignIds: ['x1', 'x2'] });

    const body = requestBody(fetch);
    expect(body.getAll('campaignIds[]')).toEqual(['x1', 'x2']);
  });

  it('keeps calendar filters as a JSON string (regression guard)', async () => {
    const { client, fetch } = createClientWithFetch();
    const calendar = new CalendarResource(client);

    const filters = { campaigns: ['002abc'], networks: ['Twitter'] };
    await calendar.get({ fromDate: '2024-01-01', toDate: '2024-01-31', filters });

    const body = requestBody(fetch);
    expect(body.get('fromDate')).toBe('2024-01-01');
    expect(body.get('filters')).toBeTruthy();
    expect(JSON.parse(body.get('filters')!)).toEqual(filters);
    expect(body.has('filters[campaigns][]')).toBe(false);
  });
});
