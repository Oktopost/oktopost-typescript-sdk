import { BaseResource } from '../base-resource.js';
import type {
  BaseApiResponse,
  PaginatedApiResponse,
  SingleApiResponse,
} from '../../types/common.js';
import type {
  Folder,
  FolderListParams,
  CreateFolderParams,
} from '../../types/media.js';

export class FoldersResource extends BaseResource {
  async list(
    params?: FolderListParams,
  ): Promise<PaginatedApiResponse<Folder>> {
    return this.httpClient.get<PaginatedApiResponse<Folder>>(
      '/media-folder',
      params,
    );
  }

  async get(id: string): Promise<Folder> {
    const response = await this.httpClient.get<
      SingleApiResponse<'Folder', Folder>
    >(`/media-folder/${id}`);
    return response.Folder;
  }

  async create(params: CreateFolderParams): Promise<Folder> {
    const response = await this.httpClient.post<
      SingleApiResponse<'Folder', Folder>
    >('/media-folder', params);
    return response.Folder;
  }

  async rename(id: string, name: string): Promise<Folder> {
    const response = await this.httpClient.post<
      SingleApiResponse<'Folder', Folder>
    >(`/media-folder/${id}`, { name });
    return response.Folder;
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/media-folder/${id}`);
  }
}
