import { BaseResource } from '../base-resource.js';
import type { BaseHttpClient } from '../../http/base-client.js';
import type {
  BaseApiResponse,
  PaginatedApiResponse,
  SingleApiResponse,
} from '../../types/common.js';
import type {
  CalendarParams,
  CalendarResponse,
  CustomCalendarEvent,
  CustomCalendarEventListParams,
  CreateCustomCalendarEventParams,
  UpdateCustomCalendarEventParams,
} from '../../types/publishing.js';

export class CalendarCustomEventsResource extends BaseResource {
  async list(
    params?: CustomCalendarEventListParams,
  ): Promise<PaginatedApiResponse<CustomCalendarEvent>> {
    return this.httpClient.get<PaginatedApiResponse<CustomCalendarEvent>>(
      '/calendar/custom-events',
      params,
    );
  }

  async get(id: string): Promise<CustomCalendarEvent> {
    const response = await this.httpClient.get<
      SingleApiResponse<'Item', CustomCalendarEvent>
    >('/calendar/custom-events', { id });
    return response.Item;
  }

  async create(
    params: CreateCustomCalendarEventParams,
  ): Promise<CustomCalendarEvent> {
    const response = await this.httpClient.post<
      SingleApiResponse<'Item', CustomCalendarEvent>
    >('/calendar/custom-events', params);
    return response.Item;
  }

  async update(
    params: UpdateCustomCalendarEventParams,
  ): Promise<CustomCalendarEvent> {
    const response = await this.httpClient.put<
      SingleApiResponse<'Item', CustomCalendarEvent>
    >('/calendar/custom-events', params);
    return response.Item;
  }

  async delete(id: string): Promise<BaseApiResponse> {
    return this.httpClient.delete<BaseApiResponse>('/calendar/custom-events', {
      id,
    });
  }
}

export class CalendarResource extends BaseResource {
  readonly customEvents: CalendarCustomEventsResource;

  constructor(httpClient: BaseHttpClient) {
    super(httpClient);
    this.customEvents = new CalendarCustomEventsResource(httpClient);
  }

  async get(params: CalendarParams): Promise<CalendarResponse> {
    return this.httpClient.post<CalendarResponse>(
      '/calendar',
      params,
    );
  }
}
