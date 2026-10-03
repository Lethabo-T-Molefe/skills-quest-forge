import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api, query, type UploadProgress } from "@/lib/api";
import type {
  Classification,
  Dataset,
  DatasetDetail,
  DatasetVersion,
  ErasureReceipt,
  Layer,
  LineageEdge,
  RowsPreview,
  SharedMember,
  UploadOptions,
  Visibility,
} from "../types";

const path = (datasetId: string, rest = "") => `/datasets/${encodeURIComponent(datasetId)}${rest}`;

export const datasetsQuery = () =>
  queryOptions({ queryKey: ["datasets"], queryFn: () => api.get<Dataset[]>("/datasets") });

export const datasetQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["datasets", datasetId],
    queryFn: () => api.get<DatasetDetail>(path(datasetId)),
  });

export const datasetRowsQuery = (datasetId: string, layer: Layer | "current" = "current") =>
  queryOptions({
    queryKey: ["datasets", datasetId, "rows", layer],
    queryFn: () => api.get<RowsPreview>(path(datasetId, `/rows${query({ layer, limit: 25 })}`)),
  });

export const datasetLineageQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["datasets", datasetId, "lineage"],
    queryFn: () => api.get<LineageEdge[]>(path(datasetId, "/lineage")),
  });

export const datasetVersionsQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["datasets", datasetId, "versions"],
    queryFn: () => api.get<DatasetVersion[]>(path(datasetId, "/versions")),
  });

export const datasetSharesQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["datasets", datasetId, "shares"],
    queryFn: () => api.get<SharedMember[]>(path(datasetId, "/shares")),
  });

/**
 * A change to one dataset changes what the catalogue, the analysis fields, the approvals badge and the
 * audit trail show, so they are all refetched.
 */
export function refreshDatasets(queryClient: QueryClient) {
  return Promise.all(
    [["datasets"], ["analysis"], ["sql"], ["metrics"], ["audit"], ["search"]].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

function fileForm(file: File, options?: UploadOptions) {
  const form = new FormData();
  form.append("file", file);
  if (options?.name?.trim()) form.append("name", options.name.trim());
  if (options?.description?.trim()) form.append("description", options.description.trim());
  if (options) {
    form.append("classification", options.classification);
    form.append("visibility", options.visibility);
  }
  return form;
}

/** Upload a file. It lands in bronze, is scanned for personal information and profiled before this returns. */
export function uploadDataset(file: File, options: UploadOptions, onProgress?: UploadProgress) {
  return api.upload<Dataset>("/datasets", fileForm(file, options), onProgress);
}

/** A new version of the same dataset, so its saved recipe can be rerun on it. */
export function uploadDatasetVersion(datasetId: string, file: File) {
  return api.post<Dataset>(path(datasetId, "/versions"), fileForm(file));
}

export function updateDataset(
  datasetId: string,
  changes: {
    name?: string;
    description?: string;
    classification?: Classification;
    visibility?: Visibility;
  },
) {
  return api.patch<Dataset>(path(datasetId), changes);
}

export function approveDataset(datasetId: string, reason: string) {
  return api.post<Dataset>(path(datasetId, "/approve"), { reason });
}

export function rejectDataset(datasetId: string, reason: string) {
  return api.post<Dataset>(path(datasetId, "/reject"), { reason });
}

/** Silver to gold: an analytics-ready copy. Personal columns never reach gold. */
export function promoteDataset(datasetId: string, columns?: string[]) {
  return api.post<Dataset>(path(datasetId, "/promote"), columns ? { columns } : {});
}

export function shareDataset(datasetId: string, emails: string[]) {
  return api.post<{ added: string[]; shares: SharedMember[] }>(path(datasetId, "/shares"), {
    emails,
  });
}

export function unshareDataset(datasetId: string, userId: string) {
  return api.delete(path(datasetId, `/shares/${encodeURIComponent(userId)}`));
}

export function decideInsight(
  datasetId: string,
  insightId: string,
  decision: "accepted" | "dismissed",
) {
  return api.post(path(datasetId, `/insights/${encodeURIComponent(insightId)}`), { decision });
}

/** Right to erasure. Irreversible: every table and file is removed and a receipt is returned. */
export function eraseDataset(datasetId: string, reason: string) {
  return api.post<ErasureReceipt>(path(datasetId, "/erase"), { reason, confirm: datasetId });
}
