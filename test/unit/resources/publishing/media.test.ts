import { describe, it, expect } from 'vitest';
import { MediaResource } from '../../../../src/resources/publishing/media.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('MediaResource', () => {
  it('get calls GET /media/{id}', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    const mockMedia = { Id: 'med1', Type: 'Image', Name: 'photo.jpg' };
    (http.get as any).mockResolvedValue({ Result: true, Media: mockMedia });

    const result = await media.get('med1');

    expect(http.get).toHaveBeenCalledWith('/media/med1');
    expect(result).toEqual(mockMedia);
  });

  it('list calls GET /media with params', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    const mockResponse = { Result: true, Items: [{ Id: 'med1' }], Total: 1 };
    (http.get as any).mockResolvedValue(mockResponse);

    const result = await media.list({ type: 'Image' });

    expect(http.get).toHaveBeenCalledWith('/media', { type: 'Image' });
    expect(result).toEqual(mockResponse);
  });

  it('list forwards folderId to filter by folder', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Items: [], Total: 0 });

    await media.list({ folderId: '035000000000001' });

    expect(http.get).toHaveBeenCalledWith('/media', { folderId: '035000000000001' });
  });

  it('list forwards an empty folderId for root-level media', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    (http.get as any).mockResolvedValue({ Result: true, Items: [], Total: 0 });

    await media.list({ folderId: '' });

    expect(http.get).toHaveBeenCalledWith('/media', { folderId: '' });
  });

  it('listAll yields all items', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    (http.get as any).mockResolvedValueOnce({
      Result: true,
      Items: [{ Id: '1' }],
      Total: 1,
    });

    const items = [];
    for await (const item of media.listAll()) {
      items.push(item);
    }

    expect(items).toHaveLength(1);
  });

  it('create calls POST /media', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    const mockMedia = { Id: 'med2', Type: 'ImageUrl' };
    (http.post as any).mockResolvedValue({ Result: true, Media: mockMedia });

    const result = await media.create({ resource: 'https://example.com/photo.jpg' });

    expect(http.post).toHaveBeenCalledWith('/media', { resource: 'https://example.com/photo.jpg' });
    expect(result).toEqual(mockMedia);
  });

  it('delete calls DELETE /media/{id}', async () => {
    const http = createMockHttpClient();
    const media = new MediaResource(http);
    (http.delete as any).mockResolvedValue({ Result: true });

    const result = await media.delete('med1');

    expect(http.delete).toHaveBeenCalledWith('/media/med1');
    expect(result.Result).toBe(true);
  });
});
