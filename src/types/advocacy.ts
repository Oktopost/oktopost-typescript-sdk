import type { BaseApiResponse, PaginationParams } from './common.js';

export interface AdvocateProfile {
  Id: string;
  Created: string;
  Name: string;
  Status: string;
  Network: string;
  ImageLink: string;
  NetworkUsername: string;
}

export interface AdvocateShare {
  Id: string;
  Created: string;
  CreatedBy: string;
  Network: string;
  CredentialId: string;
  CredentialImage: string;
  Message: string;
  ImageUrl: string;
  LinkUrl: string;
  LinkTitle: string;
  Description: string;
  Picture: string | null;
  Type: string;
  Media: unknown | null;
  StartDateTime: string;
  EndDateTime: string;
  Status: string;
  Source: string;
  TargetGeo: string;
}

export interface Advocate {
  Id: string;
  Created: string;
  Modified: string;
  Status: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PictureUrl: string | null;
  LastBoardLogin: string;
  Profiles: AdvocateProfile[];
  BoardIds: string[];
  Topics?: string[];
  LatestShares?: AdvocateShare[];
}

export interface AdvocateCustomField {
  FieldId: string;
  FieldName: string;
  Option: Record<string, unknown>;
}

export interface AdvocateListItem {
  Email: string;
  Id: string;
  LastBoardLogin: string;
  Name: string;
  PictureUrl: string | null;
  /** Only present when `boardId` is provided. */
  LastSeen?: string;
  /** Only present when `boardId` is provided. */
  Shares?: number;
  /** Only present when `boardId` is provided. */
  RoleId?: string;
  /** Only present when `boardId` is provided. */
  Role?: string;
  /** Only present when `boardId` is provided. */
  CustomFields?: AdvocateCustomField[];
  /** Only present when `boardId` is provided. */
  Leaderboards?: unknown[];
}

export interface AdvocateListParams extends PaginationParams {
  email?: string;
  /**
   * Scope results to a specific board. Enables the activity filters below and
   * additional response fields (Shares, LastSeen, Role, RoleId, CustomFields, Leaderboards).
   */
  boardId?: string;
  /** Integer (1–365). Return advocates seen within the last N days. Requires `boardId`. */
  lastSeen?: number;
  /** Integer (1–365). Return advocates NOT seen within the last N days. Requires `boardId`. */
  notSeen?: number;
  /** Return advocates who have never logged in to the board. Requires `boardId`. */
  neverSeen?: boolean;
}

export interface AdvocateGetParams {
  boardId?: string;
}

interface InviteAdvocateBase {
  /** Required. Board to invite the advocate to. */
  boardId: string;
  /** Board role for the new invite. Ignored for re-invite. */
  role?: string;
  /** Optional note attached to the invite. */
  message?: string;
}

/** Invite a brand-new advocate by email. */
export interface NewInviteAdvocateParams extends InviteAdvocateBase {
  /** Required for a new invite. */
  email: string;
  /** Required for a new invite. */
  firstName: string;
  /** Required for a new invite. */
  lastName: string;
  /** Optional advocate custom field values, keyed by field ID. */
  customFields?: Record<string, string>;
  userId?: never;
}

/** Re-invite an existing board advocate by user ID. */
export interface ReInviteAdvocateParams extends InviteAdvocateBase {
  /** Required for a re-invite. Must already be an advocate on the board. */
  userId: string;
  email?: never;
  firstName?: never;
  lastName?: never;
  customFields?: never;
}

export type InviteAdvocateParams = NewInviteAdvocateParams | ReInviteAdvocateParams;

export interface InvitedAdvocateUser {
  Id: string;
  Name: string;
  Email: string;
}

export interface InviteAdvocatesResponse extends BaseApiResponse {
  Users: InvitedAdvocateUser[];
}

/** New-invite entry for a bulk request. Requires `firstName` and `lastName`. */
export interface NewBulkInviteAdvocateEntry {
  email: string;
  firstName: string;
  lastName: string;
  /** Board role for the new invite. */
  role?: string;
  /** Optional advocate custom field values, keyed by field ID. */
  customFields?: Record<string, string>;
  userId?: never;
}

/** Re-invite entry for a bulk request. Targets an existing board advocate. */
export interface ReBulkInviteAdvocateEntry {
  userId: string;
  email?: never;
  firstName?: never;
  lastName?: never;
  role?: never;
  customFields?: never;
}

export type BulkInviteAdvocateEntry =
  | NewBulkInviteAdvocateEntry
  | ReBulkInviteAdvocateEntry;

export interface BulkInviteAdvocatesParams {
  /** Required. Board to invite advocates to. */
  boardId: string;
  /** Required. Array of 1–100 invite entries. */
  users: BulkInviteAdvocateEntry[];
  /** Optional note applied to all invites and re-invites in the batch. */
  message?: string;
}

export interface BulkInviteAdvocateError {
  /** 1-based index of the entry in `users`. */
  Id: number;
  Data: Record<string, unknown>;
  ErrorField: string;
  ErrorMessage: string;
}

export interface BulkInviteAdvocatesResponse {
  Result: boolean;
  Users: InvitedAdvocateUser[];
  Errors?: BulkInviteAdvocateError[];
}

export interface BoardConfig {
  Color: string;
  DefaultExpiration: string;
  IconId: string;
  IsAllowSuggestionsEnabled: boolean;
  IsLeaderboardEnabled: boolean;
  LogoId: string;
  LogoPosition: string;
  NotificationsDay: string | null;
  NotificationsEnabled: boolean;
  NotificationsTimeUTC: string;
  PostAddress: string;
  SignUpDomains: boolean;
  SignUpEnabled: boolean;
  Slug: string;
  Terms: string;
}

export interface Board {
  Config: BoardConfig;
  Created: string;
  Id: string;
  Name: string;
  Status: string;
  UsersCount: number;
}

export interface StoryMessage {
  Id: string;
  Network: string;
  Message: string;
  Type: string;
  Mentions: { Id: string; Text: string }[];
  LinkTitle: string;
  LinkUrl: string;
  Description: string;
  ImageUrl: string;
  VideoPreview: string;
  VideoTitle: string;
  VideoSubtitle: string;
  Media: unknown[];
}

export interface Story {
  ID: string;
  Created: string;
  Modified: string;
  AccountId: string;
  CreatedBy: string;
  ModifiedBy: string;
  BoardId: string;
  CampaignId: string;
  PublishDate: string;
  ExpirationDate: string;
  IsFeatured: boolean;
  Title: string | null;
  Description: string;
  ImageUrl: string | null;
  LinkTitle: string | null;
  LinkUrl: string | null;
  LinkDescription: string | null;
  LinkContent: string | null;
  Type: string;
  Status: string;
  /** Present on repost stories created from a LinkedIn post. */
  PostlogId?: string;
  ShareCount: number;
  AltTexts: string | null;
  VideoTitle: string | null;
  VideoPreview: string | null;
  VideoSubtitle: string | null;
  PreviewFrame: string | null;
  WorkflowId: string | null;
  Messages: StoryMessage[];
  Media: unknown[];
  Topics: string[];
  Tags: string[];
}

export interface StoryListParams {
  boardId?: string;
}

export interface CreateNormalStoryParams {
  boardId?: string;
  title: string;
  description: string;
  campaignId: string;
  mediaIds?: string;
  link?: string;
  messageIds?: string;
  topicIds?: string;
  tagIds?: string;
  publishDatetime?: number;
  expirationDatetime?: number;
  isDraft?: boolean;
  isFeatured?: boolean;
  workflowId?: string;
  /** Not allowed on a normal story. Provide `postlogId` to create a repost story instead. */
  postlogId?: never;
}

export interface CreateRepostStoryParams {
  /**
   * Postlog ID of a LinkedIn post to repost. Creates the story as a repost
   * (`type: post-attachment`). `title`/`description`/`campaignId` are optional and
   * auto-derived; `link`, `mediaIds`, and `messageIds` are ignored by the API.
   */
  postlogId: string;
  boardId?: string;
  title?: string;
  description?: string;
  campaignId?: string;
  topicIds?: string;
  tagIds?: string;
  publishDatetime?: number;
  expirationDatetime?: number;
  isDraft?: boolean;
  isFeatured?: boolean;
  workflowId?: string;
  /** Automatically create advocate messages in the background for the repost. */
  generateMessages?: boolean;
}

export type CreateStoryParams = CreateNormalStoryParams | CreateRepostStoryParams;

export interface UpdateStoryParams {
  boardId?: string;
  title?: string;
  description?: string;
  campaignId?: string;
  mediaIds?: string;
  link?: string;
  messageIds?: string;
  topicIds?: string;
  tagIds?: string;
  publishDatetime?: number;
  expirationDatetime?: number;
  isDraft?: boolean;
  isFeatured?: boolean;
  workflowId?: string;
}

export interface AddBoardMessageParams {
  boardId: string;
  messageId: string;
  startDate?: string;
  expireDate?: string;
  important?: 0 | 1;
  topicIds?: string;
}

export interface RemoveBoardMessageParams {
  boardId: string;
  messageId: string;
}

export interface Topic {
  Id: string;
  Name: string;
  BoardId: string;
  Used: string;
  Subscribers: string;
  LastUsedDate: string;
}

export interface TopicListParams {
  q?: string;
  boardId?: string;
}

export interface CreateTopicParams {
  boardId: string;
  name: string;
}

export interface UpdateTopicParams {
  name: string;
}
