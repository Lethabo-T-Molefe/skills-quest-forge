import { useQueries, useQuery } from "@tanstack/react-query";
import { getRolePermissions, getRoles } from "@/lib/api/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRolePermissions(role: string) {
  return useQuery({
    queryKey: ["roles", role, "permissions"],
    queryFn: () => getRolePermissions(role),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(role),
  });
}

// Fetches the permission row for each role in parallel, one query per role
// (results are in the same order as `roles`) — used to build the full
// role x permission matrix on the Role Management page.
export function useAllRolePermissions(roles: string[]) {
  return useQueries({
    queries: roles.map((role) => ({
      queryKey: ["roles", role, "permissions"],
      queryFn: () => getRolePermissions(role),
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(role),
    })),
  });
}
