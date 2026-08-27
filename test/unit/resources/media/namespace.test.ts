import { describe, it, expect } from 'vitest';
import { MediaNamespace } from '../../../../src/resources/media/index.js';
import { MediaResource } from '../../../../src/resources/publishing/media.js';
import { UploadsResource } from '../../../../src/resources/publishing/uploads.js';
import { FoldersResource } from '../../../../src/resources/media/folders.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('MediaNamespace', () => {
  it('creates all resource instances', () => {
    const http = createMockHttpClient();
    const media = new MediaNamespace(http);

    expect(media.media).toBeInstanceOf(MediaResource);
    expect(media.uploads).toBeInstanceOf(UploadsResource);
    expect(media.folders).toBeInstanceOf(FoldersResource);
  });
});
