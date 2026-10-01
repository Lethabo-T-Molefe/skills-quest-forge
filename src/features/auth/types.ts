export type RoleId =
  "analyst" | "practitioner" | "steward" | "executive" | "admin" | "auditor" | "curator";

/** Quotas worded for people ("12 of 40 sandbox hours"), with the raw numbers alongside. */
export interface UsageQuotas {
  compute: string;
  storage: string;
  ai: string;
  short?: { compute: string; storage: string; ai: string };
  used?: { computeSeconds: number; storageBytes: number; aiQueries: number };
  limits?: { computeSeconds: number | null; storageBytes: number | null; aiQueries: number | null };
  period?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: RoleId;
  team: string | null;
  workspace: string;
  initials: string;
  verified: boolean;
  mfaEnabled: boolean;
  permissions: string[];
  quotas: UsageQuotas;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: RoleId;
  team: string | null;
  lastActive: string;
  status?: "active" | "disabled";
  verified?: boolean;
  mfaEnabled?: boolean;
  /** This month's use against the limit, in words. Present for administrators only. */
  quotas?: { compute: string; storage: string; ai: string };
  /** Monthly limits in raw units. Null means unlimited. Present for administrators only. */
  limits?: QuotaLimits;
}

export interface QuotaLimits {
  computeSeconds: number | null;
  storageBytes: number | null;
  aiQueries: number | null;
}

/** What a role may do, and the monthly quotas it starts with. */
export interface RoleInfo {
  id: RoleId;
  label: string;
  permissions: string[];
  quotas: QuotaLimits;
}
