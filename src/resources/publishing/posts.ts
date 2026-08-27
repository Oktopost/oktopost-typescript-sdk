import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, PaginatedApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  Post,
  PostStats,
  PostListParams,
  PostGetParams,
  CreatePostParams,
  UpdatePostParams,
  ChangePostCampaignParams,
} from '../../types/publishing.js';

export class PostsResource extends BaseResource {
  async get(id: string, params?: PostGetParams): Promise<Post> {
    const response = await this.httpClient.get<
      SingleApiResponse<'Post', Post> & { Stats?: PostStats }
    >(`/post/${id}`, params);
    if (response.Stats) {
      return { ...response.Post, Stats: response.Stats };
    }
    return response.Post;
  }

  async list(params?: PostListParams): Promise<PaginatedApiResponse<Post>> {
    return this.httpClient.get<PaginatedApiResponse<Post>>(
      '/post',
      params,
    );
  }

  async *listAll(
    params?: Omit<PostListParams, '_page' | '_count'>,
  ): AsyncGenerator<Post, void, undefined> {
    yield* this.autoPaginate<Post>('/post', params);
  }

  async create(params: CreatePostParams): Promise<Post> {
    const response = await this.httpClient.post<SingleApiResponse<'Post', Post>>(
      '/post',
      params,
    );
    return response.Post;
  }

  async update(id: string, params: UpdatePostParams): Promise<Post> {
    const response = await this.httpClient.post<SingleApiResponse<'Post', Post>>(
      `/post/${id}`,
      params,
    );
    return response.Post;
  }

  async changeCampaign(
    id: string,
    params: ChangePostCampaignParams,
  ): Promise<Post> {
    const response = await this.httpClient.post<SingleApiResponse<'Post', Post>>(
      `/post/${id}/change-campaign`,
      params,
    );
    return response.Post;
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/post/${id}`);
  }
}
