import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RoleId } from "@/features/auth";

/** Row-level security: the rows of one dataset that one role may read. */
export interface RowPolicy {
  id: string;
  datasetId: string;
  dataset: string;
  role: RoleId;
  roleLabel: string;
  /** A condition over the dataset's own columns, such as region = 'Gauteng'. */
  predicate: string;
  description: string;
}

export const rowPoliciesQuery = () =>
  queryOptions({ queryKey: ["policies"], queryFn: () => api.get<RowPolicy[]>("/policies") });

/** One policy per dataset and role: setting it again replaces the earlier condition. */
export function setRowPolicy(policy: {
  datasetId: string;
  role: RoleId;
  predicate: string;
  description: string;
}) {
  return api.put<Omit<RowPolicy, "dataset" | "roleLabel">>("/policies", policy);
}

export function deleteRowPolicy(policyId: string) {
  return api.delete(`/policies/${encodeURIComponent(policyId)}`);
}
