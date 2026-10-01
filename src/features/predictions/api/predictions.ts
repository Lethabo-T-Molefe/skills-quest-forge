import { queryOptions } from "@tanstack/react-query";
import { api, query } from "@/lib/api";

/** One input to a model: a measure read over a window, its weight, and the direction that raises the score. */
export interface ModelFactor {
  key: string;
  name: string;
  why: string;
  weight: number;
  window: string;
  measure: string;
  direction: "up" | "down";
}

export interface PredictionModel {
  id: string;
  name: string;
  version: string;
  /** Name and version together, e.g. "completion-heuristic v1.4". */
  label: string;
  outcome: string;
  description: string;
  datasetId: string;
  factors: ModelFactor[];
  weightsSum: number;
  status: "active" | "retired" | string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface PredictionFactor {
  key: string;
  name: string;
  weight: number;
  direction: "up" | "down";
  /** What this factor shows for the cohort, in plain words. */
  reading: string;
  why: string;
  /** Points this factor adds to or takes from the score. */
  contribution: number;
}

export interface Prediction {
  id: string;
  subject: string;
  outcome: string;
  /** 0 to 100. */
  score: number;
  band: string;
  modelVersion: string;
  modelId: string;
  /** Dimension id → the value that defines the cohort. Empty means the whole dataset. */
  cohort: Record<string, string>;
  factors: PredictionFactor[];
  createdAt: string;
  when: string;
}

export const predictionModelsQuery = () =>
  queryOptions({
    queryKey: ["predictions", "models"],
    queryFn: () => api.get<PredictionModel[]>("/predictions/models"),
  });

/** The member's own recent scores. */
export const predictionHistoryQuery = () =>
  queryOptions({
    queryKey: ["predictions", "history"],
    queryFn: () => api.get<Prediction[]>("/predictions"),
  });

/** Score a cohort with a model. The score, its factors and the model version are recorded. */
export function scoreCohort(modelId: string, cohort: Record<string, string>) {
  return api.post<Prediction>("/predictions/score", { modelId, cohort });
}

export function exportPrediction(predictionId: string, format: "pdf" | "xlsx") {
  return api.download(
    `/predictions/${encodeURIComponent(predictionId)}/export${query({ format })}`,
    `prediction.${format}`,
  );
}
