import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
};

// Same warehouse tables the backend's analytics + data_quality domains
// allowlist for point-and-click exploration.
export const EXPLORABLE_TABLES = [
  "grants",
  "learners",
  "skills_centres",
  "etqa_assessments",
  "providers",
] as const;
export type ExplorableTable = (typeof EXPLORABLE_TABLES)[number];

export async function runSql(sql: string): Promise<QueryResult> {
  const res = await apiFetch(`${API_BASE_URL}/analytics/sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) throw new Error(`POST /analytics/sql failed: ${res.status}`);
  return res.json();
}

export async function exploreTable(table: string): Promise<QueryResult> {
  const res = await apiFetch(`${API_BASE_URL}/analytics/explore/${table}`);
  if (!res.ok) throw new Error(`GET /analytics/explore/${table} failed: ${res.status}`);
  return res.json();
}
