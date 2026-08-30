import { describe, it, expect, expectTypeOf } from 'vitest';
import { AdvocatesResource } from '../../../../src/resources/advocacy/advocates.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';
import type {
  InviteAdvocateParams,
  NewInviteAdvocateParams,
  ReInviteAdvocateParams,
  InviteAdvocatesResponse,
} from '../../../../src/types/advocacy.js';

describe('AdvocatesResource', () => {
  it('get calls GET /advocate/{id}', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    const mockAdvocate = { Id: 'a1', Name: 'John' };
    (http.get as any).mockResolvedValue({ Result: true, Advocate: mockAdvocate });

    const result = await advocates.get('a1');

    expect(http.get).toHaveBeenCalledWith('/advocate/a1', undefined);
    expect(result).toEqual(mockAdvocate);
  });

  it('get passes boardId param', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Advocate: { Id: 'a1' } });

    await advocates.get('a1', { boardId: 'b1' });

    expect(http.get).toHaveBeenCalledWith('/advocate/a1', { boardId: 'b1' });
  });

  it('list calls GET /advocate', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    const mockResponse = { Result: true, Items: [{ Id: 'a1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await advocates.list({ email: 'test@example.com' });

    expect(http.get).toHaveBeenCalledWith('/advocate', { email: 'test@example.com' });
    expect(result).toEqual(mockResponse);
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ Id: 'a1' }, { Id: 'a2' }],
      Total: 2,
    });

    const items = [];
    for await (const item of advocates.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
  });

  it('invite calls POST /advocate and returns invited Users', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    const mockResponse = {
      Result: true,
      Users: [{ Id: 'a1', Name: 'John Doe', Email: 'john@example.com' }],
    };
    (http.post as any).mockResolvedValue(mockResponse);

    const params = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', boardId: 'b1' };
    const result = await advocates.invite(params);

    expect(http.post).toHaveBeenCalledWith('/advocate', params);
    expect(result).toEqual(mockResponse);
    expect(result.Users[0].Email).toBe('john@example.com');
  });

  it('invite supports re-invite by userId', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    (http.post as any).mockResolvedValue({ Result: true, Users: [] });

    const params = { userId: 'a1', boardId: 'b1', message: 'Reminder' };
    await advocates.invite(params);

    expect(http.post).toHaveBeenCalledWith('/advocate', params);
  });

  it('bulkInvite calls POST /advocate/bulk and returns Users and Errors', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    const mockResponse = {
      Result: true,
      Users: [{ Id: 'a1', Name: 'Jimmy Mcgill', Email: 'saul@goodman.com' }],
      Errors: [
        {
          Id: 3,
          Data: { email: 'bad-email', firstName: 'Bad', lastName: 'Email' },
          ErrorField: 'email',
          ErrorMessage: 'Invalid email address',
        },
      ],
    };
    (http.post as any).mockResolvedValue(mockResponse);

    const params = {
      boardId: 'b1',
      message: 'Welcome',
      users: [
        { userId: 'a1' },
        { email: 'user@oktopost.com', firstName: 'User', lastName: 'Smith' },
        { email: 'bad-email', firstName: 'Bad', lastName: 'Email' },
      ],
    };
    const result = await advocates.bulkInvite(params);

    expect(http.post).toHaveBeenCalledWith('/advocate/bulk', params);
    expect(result).toEqual(mockResponse);
    expect(result.Errors?.[0].Id).toBe(3);
  });

  it('delete calls DELETE /advocate/{id} with boardId query', async () => {
    const http = createMockHttpClient();
    const advocates = new AdvocatesResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await advocates.delete('a1', 'b1');

    expect(http.delete).toHaveBeenCalledWith('/advocate/a1', { boardId: 'b1' });
    expect(result.Result).toBe(true);
  });
});

describe('InviteAdvocateParams (type-level)', () => {
  it('accepts a valid new invite and a valid re-invite', () => {
    const newInvite = {
      boardId: 'b1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      customFields: { cf1: 'x' },
    };
    const reInvite = { boardId: 'b1', userId: 'u1', message: 'Reminder' };

    expectTypeOf(newInvite).toExtend<InviteAdvocateParams>();
    expectTypeOf(reInvite).toExtend<InviteAdvocateParams>();
    expectTypeOf<NewInviteAdvocateParams>().toExtend<InviteAdvocateParams>();
    expectTypeOf<ReInviteAdvocateParams>().toExtend<InviteAdvocateParams>();
  });

  it('rejects invalid invite payloads', () => {
    // @ts-expect-error - neither email nor userId provided
    const invalidNeither: InviteAdvocateParams = { boardId: 'b1' };
    void invalidNeither;

    // @ts-expect-error - email and userId are mutually exclusive
    const invalidBoth: InviteAdvocateParams = {
      boardId: 'b1',
      email: 'a@b.com',
      userId: 'u1',
    };
    void invalidBoth;

    // @ts-expect-error - a new invite requires firstName and lastName
    const invalidPartial: InviteAdvocateParams = { boardId: 'b1', email: 'a@b.com', firstName: 'A' };
    void invalidPartial;
  });

  it('exposes Errors on the invite response (backward-compat)', () => {
    expectTypeOf<InviteAdvocatesResponse>().toExtend<{
      Errors?: Record<string, { Error: string }>;
    }>();
  });
});
