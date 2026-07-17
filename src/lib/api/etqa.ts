const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type AppTarget = {
  id: number;
  name: string;
  target: number;
  actual: number;
  achievement_pct: number;
};

export type CertificationTrendPoint = {
  month: string;
  certifications: number;
};

export type ProviderAccreditationSummary = {
  status: string;
  count: number;
};

export type AssessmentSummary = {
  total: number;
  competent: number;
  outstanding: number;
};

export async function getAppTargets(): Promise<AppTarget[]> {
  const res = await fetch(`${API_BASE_URL}/etqa/app-targets`);
  if (!res.ok) throw new Error(`GET /etqa/app-targets failed: ${res.status}`);
  return res.json();
}

export async function getCertificationTrend(): Promise<CertificationTrendPoint[]> {
  const res = await fetch(`${API_BASE_URL}/etqa/certification-trend`);
  if (!res.ok) throw new Error(`GET /etqa/certification-trend failed: ${res.status}`);
  return res.json();
}

export async function getProviderAccreditationSummary(): Promise<ProviderAccreditationSummary[]> {
  const res = await fetch(`${API_BASE_URL}/etqa/providers`);
  if (!res.ok) throw new Error(`GET /etqa/providers failed: ${res.status}`);
  return res.json();
}

export async function getAssessmentSummary(): Promise<AssessmentSummary> {
  const res = await fetch(`${API_BASE_URL}/etqa/assessments/summary`);
  if (!res.ok) throw new Error(`GET /etqa/assessments/summary failed: ${res.status}`);
  return res.json();
}
