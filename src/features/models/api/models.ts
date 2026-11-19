import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api, query } from "@/lib/api";
import type { PredictionModel } from "@/features/predictions";
import type {
  ColumnPlan,
  ModelDetail,
  ScoredView,
  ScoringRun,
  TrainOptions,
  TrainRequest,
} from "../types";

const modelPath = (modelId: string, rest = "") =>
  `/predictions/models/${encodeURIComponent(modelId)}${rest}`;

export const modelDetailQuery = (modelId: string) =>
  queryOptions({
    queryKey: ["predictions", "models", modelId],
    queryFn: () => api.get<ModelDetail>(modelPath(modelId)),
  });

export const trainOptionsQuery = (datasetId: string) =>
  queryOptions({
    queryKey: ["predictions", "train-options", datasetId],
    queryFn: () =>
      api.get<TrainOptions>(`/predictions/models/train/options${query({ datasetId })}`),
    enabled: Boolean(datasetId),
  });

export const scoredQuery = (modelId: string, by?: string) =>
  queryOptions({
    queryKey: ["predictions", "models", modelId, "scored", by ?? ""],
    queryFn: () => api.get<ScoredView>(modelPath(modelId, `/scored${query({ by })}`)),
  });

export function refreshModels(queryClient: QueryClient) {
  return Promise.all(
    [["predictions"], ["audit"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/** Each column's role in the model and why, before anything is trained. */
export function previewTraining(body: TrainRequest) {
  return api.post<{ plan: ColumnPlan[]; features: number; notes: string[] }>(
    "/predictions/models/train/preview",
    body,
  );
}

/** Train and validate; each algorithm is saved as a draft for someone else to review. */
export function trainModel(body: TrainRequest) {
  return api.post<PredictionModel[]>("/predictions/models/train", body);
}

export function approveModel(modelId: string, note: string) {
  return api.post<PredictionModel>(modelPath(modelId, "/approve"), { note });
}

export function rejectModel(modelId: string, reason: string) {
  return api.post<PredictionModel>(modelPath(modelId, "/reject"), { reason });
}

export function retireModel(modelId: string, reason: string) {
  return api.post<PredictionModel>(modelPath(modelId, "/retire"), { reason });
}

/** Score the records whose outcome is not known yet. */
export function scoreRecords(modelId: string) {
  return api.post<ScoringRun>(modelPath(modelId, "/score"));
}

export function exportModelCard(modelId: string) {
  return api.download(modelPath(modelId, `/card${query({ format: "pdf" })}`), "model-card.pdf");
}
