import type { InfoContent } from "@/components/lab/info-hint";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Kpi = {
  id?: number | null;
  label: string;
  value: number;
  suffix: string;
  trend: number;
  spark: number[];
  info: InfoContent;
};

export type RiskAlert = {
  id?: number | null;
  severity: string;
  title: string;
  detail: string;
};

export type RecentActivityItem = {
  id?: number | null;
  who: string;
  what: string;
  when: string;
};

export type AiRecommendation = {
  id?: number | null;
  title: string;
  rationale: string;
  impact: string;
  priority: string;
  status: string;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function postJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "POST" });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export function getHomeKpis(): Promise<Kpi[]> {
  return getJson<Kpi[]>("/dashboards/home");
}

export function getRiskAlerts(): Promise<RiskAlert[]> {
  return getJson<RiskAlert[]>("/dashboards/risk-alerts");
}

export function getRecentActivity(): Promise<RecentActivityItem[]> {
  return getJson<RecentActivityItem[]>("/dashboards/recent-activity");
}

export function getAiRecommendations(): Promise<AiRecommendation[]> {
  return getJson<AiRecommendation[]>("/dashboards/recommendations");
}

export function acceptRecommendation(id: number): Promise<AiRecommendation> {
  return postJson<AiRecommendation>(`/dashboards/recommendations/${id}/accept`);
}

export function dismissRecommendation(id: number): Promise<AiRecommendation> {
  return postJson<AiRecommendation>(`/dashboards/recommendations/${id}/dismiss`);
}
