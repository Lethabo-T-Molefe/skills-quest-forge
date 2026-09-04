import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// One row of monthly facts for one skills centre — the same shape a real
// Power BI report would query from its dataset. The frontend slices and
// aggregates this itself (by province/programme slicer, by month, ...)
// rather than the backend pre-computing fixed charts.
export type PowerBiDemoRow = {
  centre: string;
  province: string;
  programme: string;
  month: string;
  month_index: number;
  learners: number;
  completions: number;
  certified: number;
  grant_allocated: number;
  grant_spent: number;
};

export type PowerBiDemoData = {
  rows: PowerBiDemoRow[];
  provinces: string[];
  programmes: string[];
  centres: string[];
};

// configured: false until POWERBI_* is set server-side (see .env.example) —
// demo carries the static dataset above instead, so the page shows what the
// real embed will look like. Once configured, the same shape carries a live
// report_id/embed_url/access_token instead, no frontend change needed.
export type PowerBiEmbedConfig = {
  configured: boolean;
  report_name: string;
  report_id: string | null;
  embed_url: string | null;
  access_token: string | null;
  expires_at: string | null;
  demo: PowerBiDemoData | null;
};

// Fetches a fresh embed session (URL + short-lived token) for the configured
// Power BI report — minted server-side, since the service-principal secret
// used to generate it must never reach the browser. Rendered with Microsoft's
// own Power BI JavaScript SDK (powerbi-client / powerbi-client-react); the
// Power BI web app itself is never shown to the user.
export async function getPowerBiEmbedConfig(): Promise<PowerBiEmbedConfig> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/embed-config`);
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `GET /powerbi/embed-config failed: ${res.status}`);
  }
  return res.json();
}

// --- Report Builder — user-authored reports over the user's own uploaded
// datasets (Dataset Catalogue / Upload Dataset). Visuals query the warehouse
// live via /powerbi/datasets/:id/query — nothing here duplicates the data.

export type PowerBiVisualType = "kpi" | "bar" | "line" | "donut" | "table";
export type PowerBiAgg = "sum" | "avg" | "count" | "min" | "max";

export type PowerBiVisual = {
  type: PowerBiVisualType;
  title: string;
  value_column: string | null;
  agg: PowerBiAgg | null;
  group_by: string | null;
  columns: string[];
};

export type PowerBiReport = {
  id: number;
  name: string;
  dataset_id: number;
  visuals: PowerBiVisual[];
};

export type PowerBiQueryResult = {
  columns: string[];
  rows: unknown[][];
};

async function handle<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `${label} failed: ${res.status}`);
  }
  return res.json();
}

export async function listPowerBiReports(): Promise<PowerBiReport[]> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports`);
  return handle(res, "GET /powerbi/reports");
}

export async function createPowerBiReport(
  input: { name: string; dataset_id: number; visuals: PowerBiVisual[] },
): Promise<PowerBiReport> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res, "POST /powerbi/reports");
}

export async function getPowerBiReport(reportId: number): Promise<PowerBiReport> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}`);
  return handle(res, "GET /powerbi/reports/:id");
}

export async function deletePowerBiReport(reportId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}`, { method: "DELETE" });
  await handle(res, "DELETE /powerbi/reports/:id");
}

export async function queryPowerBiDataset(
  datasetId: number,
  opts: { columns?: string[]; groupBy?: string | null; agg?: PowerBiAgg | null; limit?: number },
): Promise<PowerBiQueryResult> {
  const params = new URLSearchParams();
  if (opts.columns?.length) params.set("columns", opts.columns.join(","));
  if (opts.groupBy) params.set("group_by", opts.groupBy);
  if (opts.agg) params.set("agg", opts.agg);
  if (opts.limit) params.set("limit", String(opts.limit));
  const res = await apiFetch(`${API_BASE_URL}/powerbi/datasets/${datasetId}/query?${params.toString()}`);
  return handle(res, "GET /powerbi/datasets/:id/query");
}
