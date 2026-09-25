import { useSuspenseQuery } from "@tanstack/react-query";
import { orgMembersQuery } from "../api/current-user";

export function useOrgMembers() {
  return useSuspenseQuery(orgMembersQuery()).data;
}
