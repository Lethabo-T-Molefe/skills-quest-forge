import { useSuspenseQuery } from "@tanstack/react-query";
import { cleaningStepsQuery } from "../api/cleaning-steps";

export function useCleaningSteps() {
  return useSuspenseQuery(cleaningStepsQuery()).data;
}
