import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// A real, self-hosted MLflow tracking server backs all of this (see the
// backend's infrastructure/external/mlflow_client.py) — its own web UI is
// never shown; every call here goes through this system's own JSON API and
// is rendered with CHIETA-styled components, the same principle as Notebooks
// (real Jupyter kernels, never JupyterLab's own UI).

export type MlflowExperiment = {
  experiment_id: string;
  name: string;
  lifecycle_stage: string;
};

export type MlflowRunSummary = {
  run_id: string;
  run_name: string;
  experiment_id: string;
  status: string;
  start_time: number;
  end_time: number | null;
  metrics: Record<string, number>;
  params: Record<string, string>;
  tags: Record<string, string>;
};

export type MlflowArtifact = {
  path: string;
  is_dir: boolean;
  file_size: number | null;
};

export type MlflowMetricPoint = {
  value: number;
  timestamp: number;
  step: number;
};

export type MlflowRun = {
  run_id: string;
  run_name: string;
  experiment_id: string;
  status: string;
  start_time: number;
  end_time: number | null;
  params: Record<string, string>;
  metrics: Record<string, number>;
  tags: Record<string, string>;
  metric_history: Record<string, MlflowMetricPoint[]>;
  artifacts: MlflowArtifact[];
};

export type MlflowModelVersion = {
  name: string;
  version: string;
  stage: string;
  run_id: string;
  status: string;
};

export type MlflowRegisteredModel = {
  name: string;
  versions: MlflowModelVersion[];
};

export type QuickTrainInput = {
  dataset_id: number;
  target_column: string;
  feature_columns: string[];
  algorithm: string;
  experiment_name: string;
  register_model: boolean;
};

export type QuickTrainResult = {
  run: MlflowRun;
  registered_version: MlflowModelVersion | null;
  metrics: Record<string, number>;
};

export const ALGORITHMS = [
  { value: "logistic_regression", label: "Logistic Regression", task: "classification" },
  { value: "random_forest_classifier", label: "Random Forest Classifier", task: "classification" },
  { value: "linear_regression", label: "Linear Regression", task: "regression" },
  { value: "random_forest_regressor", label: "Random Forest Regressor", task: "regression" },
] as const;

async function handle<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `${label} failed: ${res.status}`);
  }
  return res.json();
}

export async function getMlflowStatus(): Promise<{ available: boolean }> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/status`);
  return handle(res, "GET /mlflow/status");
}

export async function listExperiments(): Promise<MlflowExperiment[]> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/experiments`);
  return handle(res, "GET /mlflow/experiments");
}

export async function createExperiment(name: string): Promise<MlflowExperiment> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/experiments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return handle(res, "POST /mlflow/experiments");
}

export async function deleteExperiment(experimentId: string): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/experiments/${experimentId}`, { method: "DELETE" });
  await handle(res, "DELETE /mlflow/experiments/:id");
}

export async function searchRuns(experimentId: string, orderBy?: string): Promise<MlflowRunSummary[]> {
  const params = orderBy ? `?order_by=${encodeURIComponent(orderBy)}` : "";
  const res = await apiFetch(`${API_BASE_URL}/mlflow/experiments/${experimentId}/runs${params}`);
  return handle(res, "GET /mlflow/experiments/:id/runs");
}

export async function getRun(runId: string): Promise<MlflowRun> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/runs/${runId}`);
  return handle(res, "GET /mlflow/runs/:id");
}

export async function deleteRun(runId: string): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/runs/${runId}`, { method: "DELETE" });
  await handle(res, "DELETE /mlflow/runs/:id");
}

export async function listModels(): Promise<MlflowRegisteredModel[]> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/models`);
  return handle(res, "GET /mlflow/models");
}

export async function transitionModelStage(
  name: string, version: string, stage: string,
): Promise<MlflowModelVersion> {
  const res = await apiFetch(
    `${API_BASE_URL}/mlflow/models/${encodeURIComponent(name)}/versions/${version}/stage`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) },
  );
  return handle(res, "POST /mlflow/models/:name/versions/:version/stage");
}

export async function deleteModel(name: string): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/models/${encodeURIComponent(name)}`, { method: "DELETE" });
  await handle(res, "DELETE /mlflow/models/:name");
}

export async function quickTrain(input: QuickTrainInput): Promise<QuickTrainResult> {
  const res = await apiFetch(`${API_BASE_URL}/mlflow/quick-train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res, "POST /mlflow/quick-train");
}
