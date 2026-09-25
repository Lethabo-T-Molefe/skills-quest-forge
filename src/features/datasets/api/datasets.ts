import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import { mockDatasets } from "./mock-datasets";

export function fetchDatasets() {
  return mockResponse(mockDatasets);
}

export function fetchDataset(datasetId: string) {
  return mockResponse(mockDatasets.find((d) => d.id === datasetId) ?? null);
}

export const datasetsQuery = () => queryOptions({ queryKey: ["datasets"], queryFn: fetchDatasets });

export const datasetQuery = (datasetId: string) =>
  queryOptions({ queryKey: ["datasets", datasetId], queryFn: () => fetchDataset(datasetId) });
