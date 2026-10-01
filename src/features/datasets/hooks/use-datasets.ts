import { useSuspenseQuery } from "@tanstack/react-query";
import { datasetQuery, datasetsQuery } from "../api/datasets";

export function useDatasets() {
  return useSuspenseQuery(datasetsQuery()).data;
}

/** One dataset with its full profile. The route loader turns a missing dataset into the not-found page. */
export function useDataset(datasetId: string) {
  return useSuspenseQuery(datasetQuery(datasetId)).data;
}
