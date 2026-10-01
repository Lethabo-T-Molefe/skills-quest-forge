import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CurrentUser, OrgMember, QuotaLimits, RoleInfo } from "../types";

export function fetchCurrentUser() {
  return api.get<CurrentUser>("/auth/me");
}

export function fetchOrgMembers() {
  return api.get<OrgMember[]>("/members");
}

export const currentUserQuery = () =>
  queryOptions({
    queryKey: ["auth", "current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });

export const orgMembersQuery = () =>
  queryOptions({ queryKey: ["auth", "members"], queryFn: fetchOrgMembers });

export const rolesQuery = () =>
  queryOptions({
    queryKey: ["auth", "roles"],
    queryFn: () => api.get<RoleInfo[]>("/roles"),
    staleTime: Infinity,
  });

export async function updateMember(
  userId: string,
  changes: {
    role?: string;
    status?: "active" | "disabled";
    team?: string | null;
    /** A number overrides the role's limit; null goes back to the role's default. */
    quotas?: Partial<QuotaLimits>;
  },
) {
  return api.patch<OrgMember>(`/members/${encodeURIComponent(userId)}`, changes);
}

export async function inviteMember(member: {
  name: string;
  email: string;
  role: string;
  team?: string;
}) {
  return api.post<OrgMember>("/members", member);
}
