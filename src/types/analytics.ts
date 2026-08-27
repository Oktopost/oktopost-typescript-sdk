import type { PaginatedApiResponse, PaginationParams } from './common.js';

export interface PostAnalyticsStats {
  LinkClicks: number;
  Conversions: number;
  Comments: number;
  Likes: number;
  Shares: number;
  ImpressionsAdded: number;
}

export interface FollowerDataPoint {
  Followers: number;
  FollowersAdded: number;
  HistoryDate: string;
}

export interface FollowersParams {
  fromDate?: string;
  toDate?: string;
}

export interface Click {
  Id: string;
  Created: string;
  CampaignId: string;
  MessageId: string;
  PostId: string;
  PostlogId: string;
  LeadId: string;
  ConversionTagId: string | null;
  CredentialId: string;
  CampaignName: string;
  CredentialName: string;
  Message: string;
  LinkUrl: string;
  LinkTitle: string;
  ImageUrl: string;
  Picture: number;
  RemoteUrl: string;
  ConvertedDate: string;
  Network: string;
  UserAgent: string;
  GeoCountry: string;
  GeoCity: string;
  GeoOrganization: string;
  GeoLongitude: number;
  GeoLatitude: number;
}

export interface ClickListParams {
  _page?: number;
  _count?: 25 | 50 | 100 | 200;
  _order?: string;
  convertsOnly?: 0 | 1;
  messageId?: string;
  leadId?: string;
  campaignId?: string;
  visitorId?: string;
  before?: string;
  after?: string;
}

export interface ExportDestination {
  Email?: string;
  FirstName?: string;
  LastName?: string;
  AccountName?: string;
  Container?: string;
  Host?: string;
  Port?: number;
  Timeout?: number;
  Directory?: string;
  Username?: string;
  Password?: string;
  BucketName?: string;
  Path?: string;
}

export interface ExportItem {
  Id: string;
  DestinationType: string;
  Destination: ExportDestination;
  Type: string;
  Frequency: string;
  TimeRange: string;
  Status: 'active' | 'inactive';
}

export interface ExportDetail extends ExportItem {
  LastRunDate: string;
  LastRunFile: string;
}

export interface ExportListParams {
  _page?: number;
  _order?: string;
  status?: 'active' | 'inactive';
}

export type DashboardVisibility = 'shared' | 'private';

export interface DashboardListItem {
  Id: string;
  Name: string;
  Description: string;
  Visibility: DashboardVisibility;
  CreatedBy: string;
  Created: string;
  IsFavorite: boolean;
  CreatorName: string;
  LinkSharingVisibility: string;
}

export interface DashboardWidget {
  Id: string;
  Type: string;
  Name: string;
  Description: string;
  ChartType: string;
  Source: string;
  X: number;
  Y: number;
  Width: number;
  Height: number;
}

export interface Dashboard {
  Id: string;
  Name: string;
  Description: string;
  Type: string;
  Visibility: DashboardVisibility;
  Widgets: DashboardWidget[];
  Teams: unknown[];
}

export interface DashboardListParams extends PaginationParams {
  search?: string;
  visibility?: DashboardVisibility;
}

export interface DashboardListResponse extends PaginatedApiResponse<DashboardListItem> {
  TotalUnfiltered: number;
}

export interface DashboardReportParams {
  id: string;
  filter?: Record<string, unknown>;
}

export interface DashboardReportData {
  Data: unknown[];
  Entities: Record<string, unknown>;
}
