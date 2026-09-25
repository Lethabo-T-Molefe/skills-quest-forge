import { useSuspenseQuery } from "@tanstack/react-query";
import { datasetQuery, datasetsQuery } from "../api/datasets";

export function useDatasets() {
  return useSuspenseQuery(datasetsQuery()).data;
}

/** Returns the dataset, or null when no dataset has this id. */
export function useDataset(datasetId: string) {
  return useSuspenseQuery(datasetQuery(datasetId)).data;
}
