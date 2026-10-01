import { useSuspenseQuery } from "@tanstack/react-query";
import { cleaningCatalogueQuery, cleaningStudioQuery } from "../api/cleaning";

/** Every chapter and method, for the reference library. */
export function useCleaningCatalogue() {
  return useSuspenseQuery(cleaningCatalogueQuery()).data;
}

/** One dataset's findings, method previews and recipe. */
export function useCleaningStudio(datasetId: string) {
  return useSuspenseQuery(cleaningStudioQuery(datasetId)).data;
}
