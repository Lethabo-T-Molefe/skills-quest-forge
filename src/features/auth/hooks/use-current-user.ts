import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserQuery } from "../api/current-user";

export function useCurrentUser() {
  return useSuspenseQuery(currentUserQuery()).data;
}
