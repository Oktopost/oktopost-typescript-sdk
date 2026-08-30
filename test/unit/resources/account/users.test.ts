import { describe, it, expect } from 'vitest';
import { UsersResource } from '../../../../src/resources/account/users.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('UsersResource', () => {
  it('get calls GET /user/{id}', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const mockUser = { Id: '00A001', Name: 'Test User' };
    (http.get as any).mockResolvedValue({ Result: true, User: mockUser });

    const result = await users.get('00A001');

    expect(http.get).toHaveBeenCalledWith('/user/00A001');
    expect(result).toEqual(mockUser);
  });

  it('list calls GET /user without params', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const mockResponse = { Result: true, Items: [{ Id: '00A001' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await users.list();

    expect(http.get).toHaveBeenCalledWith('/user', undefined);
    expect(result).toEqual(mockResponse);
  });

  it('list calls GET /user with params', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const mockResponse = { Result: true, Items: [{ Id: '00A001' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const params = { q: 'okto', _order: 'name,1', _count: 50 as const, _page: 0 };
    const result = await users.list(params);

    expect(http.get).toHaveBeenCalledWith('/user', params);
    expect(result).toEqual(mockResponse);
  });

  it('listAll yields all items across pages', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const page0Items = Array.from({ length: 100 }, (_, i) => ({ Id: `${i}` }));
    const page1Items = [{ Id: '100' }, { Id: '101' }];
    (http.get as any)
      .mockResolvedValueOnce({ Result: true, Items: page0Items, Total: 102 })
      .mockResolvedValueOnce({ Result: true, Items: page1Items, Total: 102 });

    const items = [];
    for await (const item of users.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(102);
    expect(http.get).toHaveBeenCalledTimes(2);
  });

  it('listAll threads params into pagination', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Items: [{ Id: '00A001' }], Total: 1 });

    const items = [];
    for await (const item of users.listAll({ q: 'okto', _order: 'name,1' })) {
      items.push(item);
    }

    expect(items).toHaveLength(1);
    expect(http.get).toHaveBeenCalledWith('/user', {
      q: 'okto',
      _order: 'name,1',
      _page: 0,
      _count: 100,
    });
  });

  it('create calls POST /user with params', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const mockUser = { Id: '00A002', Name: 'New User' };
    (http.post as any).mockResolvedValue({ Result: true, User: mockUser });

    const params = {
      firstName: 'New',
      lastName: 'User',
      email: 'new@test.com',
      password: 'pass123',
      role: 'admin' as const,
      timezone: 'America/New_York',
    };
    const result = await users.create(params);

    expect(http.post).toHaveBeenCalledWith('/user', params);
    expect(result).toEqual(mockUser);
  });

  it('update calls POST /user/{id} with params', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    const mockUser = { Id: '00A001', FirstName: 'Updated' };
    (http.post as any).mockResolvedValue({ Result: true, User: mockUser });

    const params = { firstName: 'Updated' };
    const result = await users.update('00A001', params);

    expect(http.post).toHaveBeenCalledWith('/user/00A001', params);
    expect(result).toEqual(mockUser);
  });

  it('delete calls DELETE /user/{id}', async () => {
    const http = createMockHttpClient();
    const users = new UsersResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await users.delete('00A001');

    expect(http.delete).toHaveBeenCalledWith('/user/00A001');
    expect(result.Result).toBe(true);
  });
});
