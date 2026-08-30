import { describe, it, expect } from 'vitest';
import { FoldersResource } from '../../../../src/resources/media/folders.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('FoldersResource', () => {
  it('list calls GET /media-folder with params', async () => {
    const http = createMockHttpClient();
    const folders = new FoldersResource(http);
    const mockResponse = {
      Result: true,
      Items: [{ Id: '035001', Name: 'Blog Images', FolderId: null, Created: '2026-02-10 14:22:35' }],
      Total: 1,
    };
    (http.get as any).mockResolvedValue(mockResponse);

    const params = { folderId: '035000', q: 'blog' };
    const result = await folders.list(params);

    expect(http.get).toHaveBeenCalledWith('/media-folder', params);
    expect(result).toEqual(mockResponse);
  });

  it('get calls GET /media-folder/{id} and returns Folder', async () => {
    const http = createMockHttpClient();
    const folders = new FoldersResource(http);
    const mockFolder = { Id: '035001', Name: 'Product Screenshots', FolderId: null, Created: '2026-01-15 09:30:00' };
    (http.get as any).mockResolvedValue({ Result: true, Folder: mockFolder });

    const result = await folders.get('035001');

    expect(http.get).toHaveBeenCalledWith('/media-folder/035001');
    expect(result).toEqual(mockFolder);
  });

  it('create calls POST /media-folder and returns Folder', async () => {
    const http = createMockHttpClient();
    const folders = new FoldersResource(http);
    const mockFolder = { Id: '035003', Name: 'Campaign Assets', FolderId: '035001', Created: '2026-04-29 12:00:00' };
    (http.post as any).mockResolvedValue({ Result: true, Folder: mockFolder });

    const params = { name: 'Campaign Assets', folderId: '035001' };
    const result = await folders.create(params);

    expect(http.post).toHaveBeenCalledWith('/media-folder', params);
    expect(result).toEqual(mockFolder);
  });

  it('rename calls POST /media-folder/{id} with name and returns Folder', async () => {
    const http = createMockHttpClient();
    const folders = new FoldersResource(http);
    const mockFolder = { Id: '035001', Name: 'Product Images', FolderId: null, Created: '2026-01-15 09:30:00' };
    (http.post as any).mockResolvedValue({ Result: true, Folder: mockFolder });

    const result = await folders.rename('035001', 'Product Images');

    expect(http.post).toHaveBeenCalledWith('/media-folder/035001', { name: 'Product Images' });
    expect(result).toEqual(mockFolder);
  });

  it('delete calls DELETE /media-folder/{id}', async () => {
    const http = createMockHttpClient();
    const folders = new FoldersResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await folders.delete('035003');

    expect(http.delete).toHaveBeenCalledWith('/media-folder/035003');
    expect(result.Result).toBe(true);
  });
});
