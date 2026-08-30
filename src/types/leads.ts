export interface LeadProfile {
  Network: string;
  Url: string;
}

export interface LeadRemoteLink {
  IntegrationID: string;
  RemoteIdentifier: string;
  LinkedLeadId: string;
  IntegrationType: string;
}

export interface Lead {
  Id: string;
  ParentId: string | null;
  AccountId: string;
  Type: string;
  Email: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Photo: string | null;
  Phone: string | null;
  IsTracked: boolean;
  Profiles: LeadProfile[];
  RemoteLeads: LeadRemoteLink[];
}

export interface LeadListParams {
  search?: string;
  _page?: number;
  _count?: number;
  all_leads?: boolean;
}

export interface LeadActivity {
  Id: string;
  ActivityDate: string;
  AccountId: string;
  LeadId: string;
  Type: string;
  Network: string;
  ProfileId: string;
  PostlogId: string | null;
  Data: Record<string, unknown>;
}

export interface LeadActivityListParams {
  leadId?: string;
}

export interface ReplaceLeadLinkParams {
  integrationId: string;
  linkedRecordId: string;
  newLinkedRecordId: string;
}
