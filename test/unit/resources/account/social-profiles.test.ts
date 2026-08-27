import { describe, it, expect } from 'vitest';
import { SocialProfilesResource } from '../../../../src/resources/account/social-profiles.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('SocialProfilesResource', () => {
  it('get calls GET /credential/{id}', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockProfile = { Id: 'cred1', Name: 'My LinkedIn' };
    (http.get as any).mockResolvedValue({ Result: true, Credential: mockProfile });

    const result = await profiles.get('cred1');

    expect(http.get).toHaveBeenCalledWith('/credential/cred1');
    expect(result).toEqual(mockProfile);
  });

  it('list calls GET /credential with params', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockResponse = { Result: true, Items: [{ Id: 'cred1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const params = { network: 'LinkedIn', includeInvalid: 1 as const };
    const result = await profiles.list(params);

    expect(http.get).toHaveBeenCalledWith('/credential', params);
    expect(result).toEqual(mockResponse);
  });

  it('list calls GET /credential without params', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockResponse = { Result: true, Items: [], Total: 0 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await profiles.list();

    expect(http.get).toHaveBeenCalledWith('/credential', undefined);
    expect(result).toEqual(mockResponse);
  });

  it('update calls PUT /credential/{id}', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockProfile = { Id: 'cred1', DisplayName: 'Updated' };
    (http.put as any).mockResolvedValue({ Result: true, Credential: mockProfile });

    const result = await profiles.update('cred1', { displayName: 'Updated' });

    expect(http.put).toHaveBeenCalledWith('/credential/cred1', { displayName: 'Updated' });
    expect(result).toEqual(mockProfile);
  });

  it('delete calls DELETE /credential/{id}', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await profiles.delete('cred1');

    expect(http.delete).toHaveBeenCalledWith('/credential/cred1');
    expect(result.Result).toBe(true);
  });

  it('listTargetingPresets calls GET /credential/{id}/targeting-presets without params', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockResponse = { Result: true, Items: [{ Id: '0tp000000000001' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await profiles.listTargetingPresets('cred1');

    expect(http.get).toHaveBeenCalledWith('/credential/cred1/targeting-presets', undefined);
    expect(result).toEqual(mockResponse);
  });

  it('listTargetingPresets calls GET /credential/{id}/targeting-presets with params', async () => {
    const http = createMockHttpClient();
    const profiles = new SocialProfilesResource(http);
    const mockResponse = { Result: true, Items: [], Total: 0 };
    (http.get as any).mockResolvedValue(mockResponse);

    const params = { _page: 0, _count: 50 as const };
    const result = await profiles.listTargetingPresets('cred1', params);

    expect(http.get).toHaveBeenCalledWith('/credential/cred1/targeting-presets', params);
    expect(result).toEqual(mockResponse);
  });
});
