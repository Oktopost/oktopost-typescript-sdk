import type {
  CampaignStatus,
  MediaType,
  Network,
  PaginationParams,
  PostSource,
  PostStatus,
  UploadStatus,
} from './common.js';

export interface Campaign {
  Id: string;
  Created: string;
  Modified: string;
  Name: string;
  Status: CampaignStatus;
  AccountId: string;
  CreatedBy: string;
  ModifiedBy: string;
  Url: string;
  Color: string;
  ShortUrl: string;
  StartDate: string;
  EndDate: string;
  LastConversionDate: string;
  LastCommentFound: string;
  SendSummary: string;
  Clicks: number;
  ChildClicks: number;
  BoardClicks: number;
  Converts: number;
  ChildConverts: number;
  BoardConverts: number;
  Comments: number;
  NewComments: number;
  Likes: number;
  TotalMessages: number;
  TotalPosts: number;
  TotalPendingPosts: number;
  TotalDraftPosts: number;
  SFDCCampaignId: string;
  SFDCCampaignName: string;
  SFDCCampaignOption: string;
  Utm: string;
  Tags?: string[];
}

export interface CampaignListItem {
  Id: string;
  Name: string;
  TotalPosts: number;
  TotalPendingPosts: number;
  TotalDraftPosts: number;
  Clicks: number;
  Converts: number;
  Created: string;
  Status: CampaignStatus;
  Comments: number;
  PostsSent: number;
  Tags?: string[];
}

export interface CampaignListParams extends PaginationParams {
  q?: string;
  status?: CampaignStatus;
  withTags?: 0 | 1;
}

export interface CampaignGetParams {
  withTags?: 0 | 1;
}

export interface CreateCampaignParams {
  name: string;
  url?: string;
  tagIds?: string;
}

export interface UpdateCampaignParams {
  name?: string;
  url?: string;
  status?: 'active' | 'paused' | 'archived';
  tagIds?: string;
}

export interface MessageMedia {
  Id: string;
  Created: string;
  Modified: string;
  AccountId: string;
  Status: string;
  CreatedBy: string;
  ModifiedBy: string;
  Type: string;
  Size: number;
  Resource: string;
  Name: string;
  Description: string;
}

export interface Message {
  Id: string;
  Created: string;
  Modified: string;
  Status: string;
  AccountId: string;
  CreatedBy: string;
  ModifiedBy: string;
  CampaignId: string;
  Network: Network;
  Subject: string;
  Message: string;
  Md5: string;
  ImageUrl: string;
  Description: string;
  LinkTitle: string;
  LinkUrl: string;
  Url: string;
  Clicks: number;
  ChildClicks: number;
  BoardClicks: number;
  Converts: number;
  ChildConverts: number;
  BoardConverts: number;
  ChildrenCount: number;
  Picture: string | number;
  IsBoardMessage: number;
  Media: MessageMedia[];
  Tags?: string[];
}

export interface MessageListParams extends PaginationParams {
  campaignId?: string;
  ids?: string;
  withTags?: 0 | 1;
  network?: Network;
}

export interface CreateMessageParams {
  network: Network;
  campaignId: string;
  message: string;
  linkUrl?: string;
  linkTitle?: string;
  description?: string;
  imageUrl?: string;
  tagIds?: string;
  media?: string;
  title?: string;
}

export interface UpdateMessageParams {
  message?: string;
  linkUrl?: string;
  linkTitle?: string;
  description?: string;
  imageUrl?: string;
}

export interface PostStats {
  LinkClicks: number;
  Conversions: number;
  Comments: number;
  Likes: number;
  Shares: number;
  ImpressionsAdded: number;
}

export interface FirstComment {
  Id: string;
  Network: string;
  Status: string;
  ScheduledAt: number;
  Text: string;
  CampaignId: string;
  Media: unknown[];
}

export interface Post {
  Id: string;
  Created: string;
  Modified: string;
  Status: PostStatus;
  AccountId: string;
  CreatedBy: string;
  ModifiedBy: string;
  Source: PostSource;
  ContentSource: string;
  Queued: number;
  CampaignId: string;
  MessageId: string;
  MessageChildId: string;
  MessageStatus: string;
  Network: string;
  StartDateTime: string;
  Groups: string;
  GroupsCount: number;
  TotalCount: number;
  TargetGeo: string;
  UpdateStatus: number;
  Flag: string;
  Clicks: number;
  Converts: number;
  Comments: number;
  NewComments: number;
  Likes: number;
  Utm: string;
  Credentials: string;
  Stats?: PostStats;
  FirstComment?: FirstComment;
}

export interface PostListParams extends PaginationParams {
  campaignId?: string;
  messageId?: string;
  status?: PostStatus;
  createdBy?: string;
  source?: PostSource;
  before?: string;
  after?: string;
}

export interface PostGetParams {
  stats?: 0 | 1;
}

export interface FirstCommentInput {
  /** Comment text. Maximum 3000 characters. */
  text?: string;
  /** A single pre-uploaded image media ID. Images only. */
  media?: string;
}

export interface CreatePostParams {
  messageId: string;
  credentialIds: string;
  startDateTime?: number;
  status?: 'pending' | 'inqueue' | 'draft' | 'inqueue-draft';
  targetingPresetId?: string;
  workflowId?: string;
  firstComment?: FirstCommentInput;
}

export interface UpdatePostParams {
  messageId?: string;
  credentialIds?: string;
  startDateTime?: number;
  status?: 'pending' | 'inqueue' | 'draft' | 'inqueue-draft';
  targetingPresetId?: string;
  /** Pass `null` to remove an existing first comment. */
  firstComment?: FirstCommentInput | null;
}

export interface ChangePostCampaignParams {
  campaignId: string;
}

export interface PostlogStats {
  LinkClicks: number;
  Conversions: number;
  Comments: number;
  Likes: number;
  Shares: number;
  ImpressionsAdded: number;
  MediaClicksAdded: number;
  DetailExpandsAdded: number;
  UserFollowsAdded: number;
}

export interface Postlog {
  Id: string;
  PostId: string;
  CampaignId: string;
  MessageId: string;
  CredentialId: string;
  LinkId: string;
  LinkIds: string[];
  Created: string;
  Modified: string;
  Status: 'success' | 'failed';
  Network: string;
  RemoteId: string;
  RemoteUrl: string;
  Error: string;
  Stats?: PostlogStats;
}

export interface PostlogGetParams {
  stats?: 0 | 1;
}

export interface MediaItem {
  Id: string;
  Created: string;
  Modified: string;
  AccountId: string;
  Status: string;
  /** Folder the asset belongs to, or `null` when it is at the library root. */
  FolderId: string | null;
  CreatedBy: string;
  ModifiedBy: string;
  Type: MediaType;
  Size: number;
  Resource: string;
  Name: string;
  Description: string;
}

export interface MediaListItem extends MediaItem {
  MimeType: string;
  VideoId: string | null;
  VideoPreview: string | null;
}

export interface MediaListParams extends PaginationParams {
  q?: string;
  type?: MediaType;
  /**
   * Filter media by folder. Pass a folder ID to list assets in that folder, an
   * empty string to list only root-level assets, or omit to list across all folders.
   */
  folderId?: string;
}

export interface CreateMediaParams {
  resource: string;
}

export interface Upload {
  Id: string;
  Created: string;
  Modified: string;
  CreatedBy: string;
  Status: UploadStatus;
  Name: string;
  MimeType: string;
  TotalSize: number;
  Downloaded: number;
  Source: string;
  LastError: string | null;
  Attempts: number;
  MediaId: string | null;
}

export interface UploadListParams extends PaginationParams {
  status?: UploadStatus;
  source?: string;
}

export interface CreateUploadParams {
  source: string;
  name?: string;
  /** MIME type of the upload, e.g. `image/jpeg`, `video/mp4`, or `application/pdf`. */
  mimeType?: string;
}

export interface VideoValidation {
  isValid: boolean;
  errors: string[];
}

export interface CalendarParams {
  fromDate: string;
  toDate: string;
  filters?: CalendarFilters;
}

export interface CalendarFilters {
  campaigns?: string[];
  credentials?: string[];
  messages?: string[];
  networks?: string[];
  postSources?: string[];
  statuses?: string[];
  users?: string[];
}

export interface CalendarCampaign {
  Color: string;
  Id: string;
  Name: string;
  Status: string;
}

export interface CalendarCredential {
  BoardOnly: number;
  DisplayName: string;
  ExpiresOn: string;
  Id: string;
  ImageLink: string;
  IsHidden: number;
  Name: string;
  Network: string;
  NetworkAccountId: string;
  NetworkUsername: string;
  ParentCredentialId: string;
  Status: string;
}

export interface CalendarMessage {
  CampaignId: string;
  Clicks: number;
  Converts: number;
  Description: string;
  Id: string;
  ImageUrl: string;
  IsBoardMessage: number;
  LinkTitle: string;
  LinkUrl: string;
  MediaIds: string[];
  Message: string;
  MessageLength: number;
  Network: string;
  Status: string;
  Subject: string;
  Type: string;
  Url: string;
}

export interface CalendarPost {
  CampaignId: string;
  Clicks: number;
  ContentSource: string;
  Converts: number;
  CredentialIds: string[];
  Id: string;
  MessageId: string;
  Network: string;
  Source: string;
  StartDateTime: string;
  Status: string;
  ApproveStatus: string;
  TotalCount: number;
}

export interface CalendarResponse {
  Result: boolean;
  Campaigns: Record<string, CalendarCampaign>;
  Credentials: Record<string, CalendarCredential>;
  Media: unknown[];
  Messages: Record<string, CalendarMessage>;
  Posts: Record<string, CalendarPost>;
  CustomEvents: CustomCalendarEvent[];
}

export interface CustomCalendarEventCampaign {
  Id: string;
  Name: string;
}

export interface CustomCalendarEvent {
  ID: string;
  Created: string;
  Modified: string;
  AccountID: string;
  Title: string;
  Description: string;
  Color: string;
  StartDateTime: string;
  EndDateTime: string;
  Campaigns: CustomCalendarEventCampaign[];
}

export interface CustomCalendarEventListParams extends PaginationParams {
  ids?: string[];
  campaignIds?: string[];
  after?: number;
  before?: number;
}

export interface CreateCustomCalendarEventParams {
  title: string;
  description?: string;
  startDate: number;
  endDate?: number;
  campaignIds?: string[];
}

export interface UpdateCustomCalendarEventParams {
  id: string;
  title?: string;
  description?: string;
  startDate?: number;
  endDate?: number;
  campaignIds?: string[];
}

export interface Tag {
  Id: string;
  Created: string;
  Tag: string;
  LastUsedDate: string;
}

export type TagListParams = PaginationParams;

export interface CreateTagParams {
  tag: string;
}

export interface UpdateTagParams {
  tag: string;
}

export interface Link {
  Created: string;
  Hash: string;
  LongUrl: string;
  FinalUrl: string;
  Params: Record<string, string>;
  ShortUrl: string;
}

export interface LinkListItem {
  Id: string;
  Created: string;
  Modified: string;
  AccountId: string;
  CampaignId: string;
  MessageId: string;
  PostId: string;
  PostlogId: string;
  Hash: string;
  LongUrl: string;
  ShortUrl: string;
  Clicks: number;
  Converts: number;
  CredentialId: string;
}

export interface LinkListParams extends PaginationParams {
  hash?: string;
  credentialIds?: string;
  ids?: string;
}

export interface UpdateLinkParams {
  longUrl: string;
}
