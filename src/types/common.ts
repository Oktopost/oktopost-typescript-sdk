export interface BaseApiResponse {
  Result: boolean;
  Errors?: Record<string, { Error: string }>;
}

export type SingleApiResponse<K extends string, T> = BaseApiResponse & {
  [P in K]: T;
};

export interface PaginatedApiResponse<T> extends BaseApiResponse {
  Items: T[];
  Total: number;
}

export interface PaginationParams {
  _page?: number;
  _count?: 25 | 50 | 100;
  _order?: string;
}

export interface MeResponse extends BaseApiResponse {
  User: {
    Id: string;
    Name: string;
    Email: string;
    LastLogin: string;
  };
  Account: {
    Id: string;
    Name: string;
  };
}

export type Network =
  | 'Twitter'
  | 'LinkedIn'
  | 'Facebook'
  | 'Instagram'
  | 'YouTube'
  | 'Youtube'
  | 'WeChat'
  | 'Xing';

export type CampaignStatus = 'active' | 'paused' | 'archived' | 'complete';

export type PostStatus =
  | 'pending'
  | 'inqueue'
  | 'inqueue-draft'
  | 'draft'
  | 'complete'
  | 'incomplete'
  | 'error';

export type PostSource = 'UI' | 'API' | 'Autoposter' | 'Bookmarklet' | 'Board' | 'Embedded';

export type UserRole = 'admin' | 'publisher' | 'contributor' | 'read';

export type MediaType = 'Image' | 'Video' | 'ImageUrl' | 'PDF';

export type UploadStatus = 'pending' | 'failed' | 'complete';

export type IntegrationType = 'cd' | 'ga' | 'pardot' | 'netresults' | 'mautic' | 'facebook';

export interface OktopostRequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface OktopostResponseInfo {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}
