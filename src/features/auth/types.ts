export type RoleId =
  | "analyst"
  | "practitioner"
  | "steward"
  | "executive"
  | "admin"
  | "auditor"
  | "curator";

export interface UsageQuotas {
  compute: string;
  storage: string;
  ai: string;
}

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
  roleId: RoleId;
  workspace: string;
  initials: string;
  verified: boolean;
  mfaEnabled: boolean;
  quotas: UsageQuotas;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: RoleId;
  lastActive: string;
  quotas: UsageQuotas;
}
