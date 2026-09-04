import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type PipelineRun = {
  id: number;
  dag: string;
  status: string;
  duration: string;
  last_run: string;
  rows: number;
};

export type MlExperiment = {
  id: number;
  name: string;
  algorithm: string;
  metric: string;
  status: string;
  author: string;
  run_at: string;
};

export type ServiceStatus = {
  name: string;
  status: string;
};

export type SystemMetricPoint = {
  hour_label: string;
  cpu: number;
  memory: number;
};

export type LatencyPercentile = {
  label: string;
  ms: number;
};

export type SystemError = {
  ts: string;
  severity: string;
  service: string;
  message: string;
};

export type SystemHealth = {
  services: ServiceStatus[];
  metrics: SystemMetricPoint[];
  latency_percentiles: LatencyPercentile[];
  recent_errors: SystemError[];
  checked_at: string;
};

export async function getPipelineRuns(): Promise<PipelineRun[]> {
  const res = await apiFetch(`${API_BASE_URL}/operations/pipelines`);
  if (!res.ok) throw new Error(`GET /operations/pipelines failed: ${res.status}`);
  return res.json();
}

export async function getMlExperiments(): Promise<MlExperiment[]> {
  const res = await apiFetch(`${API_BASE_URL}/operations/experiments`);
  if (!res.ok) throw new Error(`GET /operations/experiments failed: ${res.status}`);
  return res.json();
}

export async function promoteModel(id: number, status: string): Promise<MlExperiment> {
  const res = await apiFetch(`${API_BASE_URL}/operations/experiments/${id}/promote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`POST /operations/experiments/${id}/promote failed: ${res.status}`);
  return res.json();
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const res = await apiFetch(`${API_BASE_URL}/operations/health`);
  if (!res.ok) throw new Error(`GET /operations/health failed: ${res.status}`);
  return res.json();
}
