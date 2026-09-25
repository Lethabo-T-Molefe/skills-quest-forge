import { useSuspenseQuery } from "@tanstack/react-query";
import { cleaningProfileQuery, cleaningStepsQuery } from "../api/cleaning-steps";

export function useCleaningStudio() {
  return useSuspenseQuery(cleaningStepsQuery()).data;
}

export function useCleaningProfile() {
  return useSuspenseQuery(cleaningProfileQuery()).data;
}

/** @deprecated Use useCleaningStudio(). Kept so older imports do not explode during the rewrite. */
export function useCleaningSteps() {
  const studio = useCleaningStudio();
  return studio.methods.filter((method) => method.recommended);
}
