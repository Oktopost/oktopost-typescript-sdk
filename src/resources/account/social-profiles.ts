import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, PaginatedApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  SocialProfile,
  SocialProfileListParams,
  UpdateSocialProfileParams,
  TargetingPreset,
  TargetingPresetListParams,
} from '../../types/account.js';

export class SocialProfilesResource extends BaseResource {
  async get(id: string): Promise<SocialProfile> {
    const response = await this.httpClient.get<SingleApiResponse<'Credential', SocialProfile>>(
      `/credential/${id}`,
    );
    return response.Credential;
  }

  async list(params?: SocialProfileListParams): Promise<PaginatedApiResponse<SocialProfile>> {
    return this.httpClient.get<PaginatedApiResponse<SocialProfile>>(
      '/credential',
      params,
    );
  }

  async update(id: string, params: UpdateSocialProfileParams): Promise<SocialProfile> {
    const response = await this.httpClient.put<SingleApiResponse<'Credential', SocialProfile>>(
      `/credential/${id}`,
      params,
    );
    return response.Credential;
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>(`/credential/${id}`);
  }

  async listTargetingPresets(
    id: string,
    params?: TargetingPresetListParams,
  ): Promise<PaginatedApiResponse<TargetingPreset>> {
    return this.httpClient.get<PaginatedApiResponse<TargetingPreset>>(
      `/credential/${id}/targeting-presets`,
      params,
    );
  }
}
