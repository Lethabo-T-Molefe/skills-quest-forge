import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import { demoUser, orgMembers } from "../constants";
import type { CurrentUser } from "../types";
import { getSession } from "./session";

export function fetchCurrentUser() {
  return mockResponse(getSession() ?? demoUser);
}

export function fetchOrgMembers() {
  return mockResponse(orgMembers);
}

export const currentUserQuery = () =>
  queryOptions({ queryKey: ["auth", "current-user"], queryFn: fetchCurrentUser });

export const orgMembersQuery = () =>
  queryOptions({ queryKey: ["auth", "members"], queryFn: fetchOrgMembers });
