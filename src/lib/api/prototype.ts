import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type PredictionFactor = { name: string; pct: number };
export type CompletionPrediction = { predicted_pct: number; factors: PredictionFactor[] };
export type CompletionRequest = { province: string; programme: string; funding_type: string };

export type GrantRiskScore = { score: number; tier: string; reasons: string[] };
export type GrantRiskRequest = {
  allocated: number;
  spent: number;
  province: string;
  days_since_last_drawdown: number;
};

export type CentreDemandForecast = {
  series: Record<string, unknown>[];
  expected_learners: number;
  recommendation: string;
};
export type CentreDemandRequest = { centre_id_or_province: string; months?: number };

export type ScenarioResult = {
  additional_learners: number;
  completion_impact: number;
  budget_impact: number;
  risk_change: number;
  compare: Record<string, unknown>[];
  narrative: string;
};
export type ScenarioRequest = {
  scenario_type: string;
  target_province: string;
  funding_increase_pct: number;
};

export type Recommendation = {
  id: number;
  title: string;
  rationale: string;
  impact: string;
  priority: string;
  status: string;
};

async function postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await apiFetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const predictCompletion = (body: CompletionRequest) =>
  postJson<CompletionRequest, CompletionPrediction>("/prototype/predict/completion", body);

export const scoreGrantRisk = (body: GrantRiskRequest) =>
  postJson<GrantRiskRequest, GrantRiskScore>("/prototype/predict/grant-risk", body);

export const forecastCentreDemand = (body: CentreDemandRequest) =>
  postJson<CentreDemandRequest, CentreDemandForecast>("/prototype/predict/centre-demand", body);

export const runScenarioSimulation = (body: ScenarioRequest) =>
  postJson<ScenarioRequest, ScenarioResult>("/prototype/simulate", body);

export async function getPrototypeRecommendations(): Promise<Recommendation[]> {
  const res = await apiFetch(`${API_BASE_URL}/prototype/recommendations`);
  if (!res.ok) throw new Error(`GET /prototype/recommendations failed: ${res.status}`);
  return res.json();
}

export async function acceptPrototypeRecommendation(id: number): Promise<Recommendation> {
  const res = await apiFetch(`${API_BASE_URL}/prototype/recommendations/${id}/accept`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`POST /prototype/recommendations/${id}/accept failed: ${res.status}`);
  return res.json();
}

export async function dismissPrototypeRecommendation(id: number): Promise<Recommendation> {
  const res = await apiFetch(`${API_BASE_URL}/prototype/recommendations/${id}/dismiss`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`POST /prototype/recommendations/${id}/dismiss failed: ${res.status}`);
  }
  return res.json();
}
