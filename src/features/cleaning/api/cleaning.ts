import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CleaningCatalogue,
  CleaningRecipe,
  CleaningRun,
  CleaningStudio,
  RecipeStep,
} from "../types";

const path = (datasetId: string, rest: string) =>
  `/cleaning/${encodeURIComponent(datasetId)}${rest}`;

/** Every chapter and method, independent of a dataset. */
export const cleaningCatalogueQuery = () =>
  queryOptions({
    queryKey: ["cleaning", "catalogue"],
    queryFn: () => api.get<CleaningCatalogue>("/cleaning/catalogue"),
    staleTime: Infinity,
  });

/**
 * The chapters with this dataset's findings, and each method tried on a sample as the recipe so far has
 * left it. It is recomputed whenever the recipe changes, so previews always follow the earlier steps.
 */
export const cleaningStudioQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["cleaning", "studio", datasetId],
    queryFn: () => api.get<CleaningStudio>(path(datasetId, "/studio")),
  });

export const recipeHistoryQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["cleaning", "recipes", datasetId],
    queryFn: () => api.get<CleaningRecipe[]>(path(datasetId, "/recipes")),
  });

/**
 * Record a decision. The settings sent are the ones the preview was worked out with, so what is applied
 * is exactly what the member saw.
 */
export function addStep(
  datasetId: string,
  methodId: string,
  status: RecipeStep["status"],
  params: Record<string, unknown>,
) {
  return api.post<CleaningRecipe>(path(datasetId, "/recipe/steps"), { methodId, status, params });
}

export function removeStep(datasetId: string, stepId: string) {
  return api.delete<CleaningRecipe>(path(datasetId, `/recipe/steps/${encodeURIComponent(stepId)}`));
}

/** Run the whole recipe on the raw data and write the cleaned table to silver, pending approval. */
export function runRecipe(datasetId: string) {
  return api.post<CleaningRun>(path(datasetId, "/run"));
}

/** Rerun an applied recipe on the current raw version, and report whether the output reproduced exactly. */
export function rerunRecipe(datasetId: string, recipeId: string) {
  return api.post<CleaningRun>(path(datasetId, `/recipes/${encodeURIComponent(recipeId)}/rerun`));
}
