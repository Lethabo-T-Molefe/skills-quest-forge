import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type BiasModel = {
  id: number;
  model: string;
  owner: string;
  status: string;
  last_reviewed: string;
  reviewer: string;
};

export type FairnessMetric = {
  id: number;
  model_id: number;
  attribute: string;
  metric: string;
  gap: number;
  threshold: number;
  status: string;
};

export type DisparateImpactPoint = {
  id: number;
  model_id: number;
  province: string;
  predicted: number;
  actual: number;
};

export type ExplainabilityFactor = {
  id: number;
  model_id: number;
  feature: string;
  pct: number;
};

export async function getBiasModels(): Promise<BiasModel[]> {
  const res = await apiFetch(`${API_BASE_URL}/ethics/models`);
  if (!res.ok) throw new Error(`GET /ethics/models failed: ${res.status}`);
  return res.json();
}

export async function getFairnessMetrics(modelId: number): Promise<FairnessMetric[]> {
  const res = await apiFetch(`${API_BASE_URL}/ethics/models/${modelId}/fairness`);
  if (!res.ok) throw new Error(`GET /ethics/models/${modelId}/fairness failed: ${res.status}`);
  return res.json();
}

export async function getDisparateImpact(modelId: number): Promise<DisparateImpactPoint[]> {
  const res = await apiFetch(`${API_BASE_URL}/ethics/models/${modelId}/disparate-impact`);
  if (!res.ok) throw new Error(`GET /ethics/models/${modelId}/disparate-impact failed: ${res.status}`);
  return res.json();
}

export async function getExplainability(modelId: number): Promise<ExplainabilityFactor[]> {
  const res = await apiFetch(`${API_BASE_URL}/ethics/models/${modelId}/explainability`);
  if (!res.ok) throw new Error(`GET /ethics/models/${modelId}/explainability failed: ${res.status}`);
  return res.json();
}

export async function signOffModel(modelId: number): Promise<BiasModel> {
  const res = await apiFetch(`${API_BASE_URL}/ethics/models/${modelId}/sign-off`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /ethics/models/${modelId}/sign-off failed: ${res.status}`);
  return res.json();
}
