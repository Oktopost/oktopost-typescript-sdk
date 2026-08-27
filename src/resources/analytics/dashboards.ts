import { BaseResource } from '../base-resource.js';
import type { BaseApiResponse, SingleApiResponse } from '../../types/common.js';
import type {
  Dashboard,
  DashboardListItem,
  DashboardListParams,
  DashboardListResponse,
  DashboardReportData,
  DashboardReportParams,
} from '../../types/analytics.js';

export class DashboardsResource extends BaseResource {
  async list(params?: DashboardListParams): Promise<DashboardListResponse> {
    return this.httpClient.get<DashboardListResponse>('/dashboard', params);
  }

  async *listAll(
    params?: Omit<DashboardListParams, '_page' | '_count'>,
  ): AsyncGenerator<DashboardListItem, void, undefined> {
    yield* this.autoPaginate<DashboardListItem>('/dashboard', params);
  }

  async get(id: string): Promise<Dashboard> {
    const response = await this.httpClient.get<SingleApiResponse<'Dashboard', Dashboard>>(
      `/dashboard/${id}`,
    );
    return response.Dashboard;
  }

  async getReportData(
    dashboardId: string,
    params: DashboardReportParams,
  ): Promise<DashboardReportData> {
    return this.httpClient.get<BaseApiResponse & DashboardReportData>(
      `/dashboard/${dashboardId}/report`,
      params,
    );
  }
}
