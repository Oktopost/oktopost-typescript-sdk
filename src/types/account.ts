import type { PaginationParams, UserRole } from './common.js';

export interface User {
  Id: string;
  Created: string;
  Modified: string;
  Status: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Email: string;
  LastLogin: string;
  LastBoardLogin: string;
  HasBrowserExtension: number;
  LinkedInId: string;
  LinkedInName: string;
  LinkedInImageUrl: string;
  TwitterId: string;
  TwitterName: string;
  TwitterImageUrl: string;
  FacebookId: string;
  FacebookName: string;
  FacebookImageUrl: string;
  Timezone: string;
}

export interface UserListItem {
  Id: string;
  Name: string;
  Email: string;
  LastLogin: string;
  Role: UserRole;
  Timezone: string;
}

export interface UserListParams extends PaginationParams {
  q?: string;
}

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  timezone: string;
}

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  timezone?: string;
}

export interface Team {
  Id: string;
  Created: string;
  Modified: string;
  Name: string;
}

export interface CreateTeamParams {
  name: string;
}

export interface UpdateTeamParams {
  name: string;
}

export interface AddTeamEntitiesParams {
  teamIds: string;
}

export interface RemoveTeamEntitiesParams {
  teamIds: string;
}

export interface SocialProfile {
  Id: string;
  Created: string;
  Name: string;
  DisplayName: string;
  Status: 'valid' | 'invalid';
  Network: string;
  ImageLink: string;
  NetworkUsername: string;
  NativePostsEnabled: number;
}

export interface SocialProfileListParams {
  network?: string;
  includeInvalid?: 0 | 1;
}

export interface UpdateSocialProfileParams {
  displayName?: string;
  nativePostsEnabled?: 0 | 1;
}

export interface TargetingPreset {
  Id: string;
  CredentialId: string;
  AccountId: string;
  Name: string;
  CompanySize: string[];
  Industry: string[];
  Function: string[];
  Seniority: string[];
  Geography: string[];
  Language: string[];
}

export type TargetingPresetListParams = Pick<PaginationParams, '_page' | '_count'>;

export interface Cname {
  Id: string;
  Created: string;
  Modified: string;
  AccountId: string;
  Name: string;
}

export interface CreateCnameParams {
  cname: string;
}

export interface UpdateCnameParams {
  cname: string;
}

export interface ConversionTag {
  Id: string;
  Tag: string;
  Value: string;
  Status: 'active' | 'inactive';
  Conversions: number;
}

export interface NotificationSettings {
  EmailDaily: boolean;
  EmailWeekly: boolean;
  EmailCampaignComplete: boolean;
  EmailOnNewAssignment: boolean;
  EmailOnNoteAdded: boolean;
  EmailOnNoteMention: boolean;
  EmailOnStatusChange: boolean;
  SendDailyEmailReport: boolean;
}

export interface UpdateNotificationParams {
  EmailDaily?: 0 | 1;
  EmailWeekly?: 0 | 1;
  EmailCampaignComplete?: 0 | 1;
  EmailOnNewAssignment?: 0 | 1;
  EmailOnNoteAdded?: 0 | 1;
  EmailOnNoteMention?: 0 | 1;
  EmailOnStatusChange?: 0 | 1;
  SendDailyEmailReport?: 0 | 1;
}
