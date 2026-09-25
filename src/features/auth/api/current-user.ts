import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { CurrentUser } from "../types";

const currentUser: CurrentUser = {
  name: "Thandi Mokoena",
  role: "Everyday Analyst",
  workspace: "Thandi's workspace",
  initials: "TM",
};

export function fetchCurrentUser() {
  return mockResponse(currentUser);
}

export const currentUserQuery = () =>
  queryOptions({ queryKey: ["auth", "current-user"], queryFn: fetchCurrentUser });
