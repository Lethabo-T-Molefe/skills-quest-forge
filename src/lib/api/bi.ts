const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type BiChart = {
  id: number;
  name: string;
  viz_type: string;
};

export type BiDashboard = {
  id: number;
  title: string;
  charts: BiChart[];
};

export type BiChartData = {
  columns: string[];
  rows: unknown[][];
};

export async function listDashboards(): Promise<BiDashboard[]> {
  const res = await fetch(`${API_BASE_URL}/bi/dashboards`);
  if (!res.ok) throw new Error(`GET /bi/dashboards failed: ${res.status}`);
  return res.json();
}

export async function getChartData(chartId: number): Promise<BiChartData> {
  const res = await fetch(`${API_BASE_URL}/bi/charts/${chartId}/data`);
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `GET /bi/charts/${chartId}/data failed: ${res.status}`);
  }
  return res.json();
}

// Runs ad-hoc SQL through Superset's SQL Lab (the SQL Workspace's execution
// engine) — Superset's own SQL editor UI is never shown to the user.
export async function executeSql(sql: string): Promise<BiChartData> {
  const res = await fetch(`${API_BASE_URL}/bi/sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /bi/sql failed: ${res.status}`);
  }
  return res.json();
}
