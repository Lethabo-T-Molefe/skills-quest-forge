import { useSuspenseQuery } from "@tanstack/react-query";
import { cleaningProfileQuery, cleaningStepsQuery } from "../api/cleaning-steps";

export function useCleaningStudio() {
  return useSuspenseQuery(cleaningStepsQuery()).data;
}

export function useCleaningProfile() {
  return useSuspenseQuery(cleaningProfileQuery()).data;
}
