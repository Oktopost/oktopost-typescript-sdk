export { Oktopost } from './client.js';
export type { OktopostConfig } from './client.js';
export { collectAll } from './pagination/paginator.js';
export { BaseResource } from './resources/base-resource.js';
export { BaseHttpClient } from './http/base-client.js';
export type { HttpClientConfig } from './http/base-client.js';
export {
  OktopostError,
  OktopostApiError,
  OktopostAuthError,
  OktopostPermissionError,
  OktopostNotFoundError,
  OktopostRateLimitError,
  OktopostTimeoutError,
} from './http/errors.js';
export { SDK_VERSION } from './version.js';

export { AccountNamespace } from './resources/account/index.js';
export {
  UsersResource,
  TeamsResource,
  TeamEntitiesResource,
  SocialProfilesResource,
  CnamesResource,
  ConversionTagsResource,
  NotificationsResource,
} from './resources/account/index.js';

export { PublishingNamespace } from './resources/publishing/index.js';
export {
  CampaignsResource,
  MessagesResource,
  PostsResource,
  PostLogResource,
  MediaResource,
  UploadsResource,
  CalendarResource,
  CalendarCustomEventsResource,
  TagsResource,
  LinksResource,
} from './resources/publishing/index.js';

export { MediaNamespace } from './resources/media/index.js';
export { FoldersResource } from './resources/media/index.js';

export { AnalyticsNamespace } from './resources/analytics/index.js';
export {
  PostAnalyticsResource,
  FollowersResource,
  ClicksResource,
  ExportsResource,
  DashboardsResource,
} from './resources/analytics/index.js';

export { InboxNamespace } from './resources/inbox/index.js';
export {
  CommentsResource,
  ConversationsResource,
  ConversationTagsResource,
  CannedResponsesResource,
} from './resources/inbox/index.js';

export { AdvocacyNamespace } from './resources/advocacy/index.js';
export {
  AdvocatesResource,
  BoardsResource,
  StoriesResource,
  BoardMessagesResource,
  TopicsResource,
} from './resources/advocacy/index.js';

export { ApprovalsNamespace } from './resources/approvals/index.js';
export {
  WorkflowsResource,
  WorkflowStepsResource,
  WorkflowItemsResource,
  WorkflowItemNotesResource,
} from './resources/approvals/index.js';

export { StreamsNamespace } from './resources/streams/index.js';
export {
  StreamTabsResource,
  StreamsResource,
} from './resources/streams/index.js';

export { LeadsNamespace } from './resources/leads/index.js';
export {
  LeadsResource,
  LeadActivitiesResource,
  LeadLinksResource,
} from './resources/leads/index.js';

export { EventsNamespace } from './resources/events/index.js';
export {
  WebhookConfigsResource,
  WebhookLogResource,
} from './resources/events/index.js';

export type {
  BaseApiResponse,
  SingleApiResponse,
  PaginatedApiResponse,
  PaginationParams,
  MeResponse,
  Network,
  CampaignStatus,
  PostStatus,
  PostSource,
  UserRole,
  MediaType,
  UploadStatus,
  IntegrationType,
  OktopostRequestInfo,
  OktopostResponseInfo,
} from './types/common.js';

export type {
  User,
  UserListItem,
  CreateUserParams,
  UpdateUserParams,
  Team,
  CreateTeamParams,
  UpdateTeamParams,
  AddTeamEntitiesParams,
  RemoveTeamEntitiesParams,
  UserListParams,
  SocialProfile,
  SocialProfileListParams,
  UpdateSocialProfileParams,
  TargetingPreset,
  TargetingPresetListParams,
  Cname,
  CreateCnameParams,
  UpdateCnameParams,
  ConversionTag,
  NotificationSettings,
  UpdateNotificationParams,
} from './types/account.js';

export type {
  Campaign,
  CampaignListItem,
  CampaignListParams,
  CampaignGetParams,
  CreateCampaignParams,
  UpdateCampaignParams,
  MessageMedia,
  Message,
  MessageListParams,
  CreateMessageParams,
  UpdateMessageParams,
  PostStats,
  Post,
  PostListParams,
  PostGetParams,
  CreatePostParams,
  UpdatePostParams,
  ChangePostCampaignParams,
  PostlogStats,
  Postlog,
  PostlogGetParams,
  MediaItem,
  MediaListItem,
  MediaListParams,
  CreateMediaParams,
  Upload,
  UploadListParams,
  CreateUploadParams,
  VideoValidation,
  CalendarParams,
  CalendarFilters,
  CalendarCampaign,
  CalendarCredential,
  CalendarMessage,
  CalendarPost,
  CalendarResponse,
  CustomCalendarEventCampaign,
  CustomCalendarEvent,
  CustomCalendarEventListParams,
  CreateCustomCalendarEventParams,
  UpdateCustomCalendarEventParams,
  Tag,
  TagListParams,
  CreateTagParams,
  UpdateTagParams,
  Link,
  LinkListItem,
  LinkListParams,
  UpdateLinkParams,
} from './types/publishing.js';

export type { Folder, FolderListParams, CreateFolderParams } from './types/media.js';

export type {
  PostAnalyticsStats,
  FollowerDataPoint,
  FollowersParams,
  Click,
  ClickListParams,
  ExportDestination,
  ExportItem,
  ExportDetail,
  ExportListParams,
  DashboardVisibility,
  DashboardListItem,
  DashboardWidget,
  Dashboard,
  DashboardListParams,
  DashboardListResponse,
  DashboardReportParams,
  DashboardReportData,
} from './types/analytics.js';

export type {
  Comment,
  CommentListParams,
  ConversationItemType,
  ConversationStatus,
  ConversationTagRef,
  Conversation,
  ConversationTimelineEntry,
  ConversationAssignment,
  ConversationListParams,
  ConversationListResponse,
  ConversationTimelineParams,
  AssignConversationParams,
  ReplyConversationParams,
  CreateSalesforceCaseParams,
  ConversationTag,
  ConversationTagListParams,
  UpdateConversationTagParams,
  CannedResponseVisibility,
  CannedResponseAuthor,
  CannedResponse,
  CannedResponseListParams,
  CreateCannedResponseParams,
} from './types/inbox.js';

export type {
  AdvocateProfile,
  AdvocateShare,
  Advocate,
  AdvocateListItem,
  AdvocateListParams,
  AdvocateGetParams,
  AdvocateCustomField,
  InviteAdvocateParams,
  InvitedAdvocateUser,
  InviteAdvocatesResponse,
  BulkInviteAdvocateEntry,
  BulkInviteAdvocatesParams,
  BulkInviteAdvocateError,
  BulkInviteAdvocatesResponse,
  BoardConfig,
  Board,
  StoryMessage,
  Story,
  StoryListParams,
  CreateStoryParams,
  UpdateStoryParams,
  AddBoardMessageParams,
  RemoveBoardMessageParams,
  Topic,
  TopicListParams,
  CreateTopicParams,
  UpdateTopicParams,
} from './types/advocacy.js';

export type {
  WorkflowApprover,
  WorkflowStep,
  Workflow,
  WorkflowListParams,
  WorkflowGetParams,
  WorkflowStepListParams,
  WorkflowItem,
  WorkflowItemAuthor,
  WorkflowItemListParams,
  WorkflowItemListResponse,
  CreateWorkflowItemParams,
  ApproveRejectParams,
  WorkflowNoteAuthor,
  WorkflowItemNote,
  WorkflowItemNoteListResponse,
} from './types/approvals.js';

export type {
  StreamTab,
  CreateStreamTabParams,
  UpdateStreamTabParams,
  Stream,
  StreamListParams,
  CreateStreamParams,
  UpdateStreamPositionParams,
} from './types/streams.js';

export type {
  LeadProfile,
  LeadRemoteLink,
  Lead,
  LeadListParams,
  LeadActivity,
  LeadActivityListParams,
  ReplaceLeadLinkParams,
} from './types/leads.js';

export type {
  WebhookConfig,
  WebhookConfigListParams,
  CreateWebhookConfigParams,
  UpdateWebhookConfigParams,
  WebhookLogEntry,
} from './types/events.js';

