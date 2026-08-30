import type { BaseHttpClient } from '../../http/base-client.js';
import { MediaResource } from '../publishing/media.js';
import { UploadsResource } from '../publishing/uploads.js';
import { FoldersResource } from './folders.js';

export class MediaNamespace {
  readonly media: MediaResource;
  readonly uploads: UploadsResource;
  readonly folders: FoldersResource;

  constructor(httpClient: BaseHttpClient) {
    this.media = new MediaResource(httpClient);
    this.uploads = new UploadsResource(httpClient);
    this.folders = new FoldersResource(httpClient);
  }
}

export { FoldersResource } from './folders.js';
export { MediaResource } from '../publishing/media.js';
export { UploadsResource } from '../publishing/uploads.js';
