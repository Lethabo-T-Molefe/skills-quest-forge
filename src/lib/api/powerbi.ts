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

export type PowerBiVisualType =
  | "kpi" | "bar" | "line" | "donut" | "table"
  | "scatter" | "waterfall" | "gauge" | "matrix" | "slicer";
export type PowerBiAgg = "sum" | "avg" | "count" | "min" | "max";
export type PowerBiDateBucket = "day" | "week" | "month" | "quarter" | "year";
export type PowerBiFormulaOp = "+" | "-" | "*" | "/";
export type PowerBiFilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

export type PowerBiFilter = { column: string; op: PowerBiFilterOp; value: unknown };
export type PowerBiFormula = { left: string; op: PowerBiFormulaOp; right: string };
export type PowerBiFormatRule = {
  operator: "gt" | "gte" | "lt" | "lte" | "eq";
  value: number;
  color: string;
};
export type PowerBiJoin = {
  dataset_id: number;
  left_on: string;
  right_on: string;
  right_columns: string[];
};

export type PowerBiVisual = {
  type: PowerBiVisualType;
  title: string;
  value_column: string | null;
  agg: PowerBiAgg | null;
  group_by: string | null;
  columns: string[];
  x_column?: string | null;
  y_column?: string | null;
  group_by_2?: string | null;
  date_bucket?: PowerBiDateBucket | null;
  compare_previous_period?: boolean;
  formula?: PowerBiFormula | null;
  format_rules?: PowerBiFormatRule[];
  join?: PowerBiJoin | null;
};

export type PowerBiBookmark = { name: string; filters: PowerBiFilter[] };
export type PowerBiTheme = { colors: string[] };

export type PowerBiReport = {
  id: number;
  name: string;
  dataset_id: number;
  visuals: PowerBiVisual[];
  owner?: string | null;
  allowed_roles?: string[];
  theme?: PowerBiTheme | null;
  bookmarks?: PowerBiBookmark[];
  share_token?: string | null;
};

export type PowerBiSharedReport = {
  name: string;
  dataset_id: number;
  visuals: PowerBiVisual[];
  theme: PowerBiTheme | null;
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

export type PowerBiReportInput = {
  name: string;
  dataset_id: number;
  visuals: PowerBiVisual[];
  allowed_roles?: string[];
  theme?: PowerBiTheme | null;
  bookmarks?: PowerBiBookmark[];
};

export async function createPowerBiReport(input: PowerBiReportInput): Promise<PowerBiReport> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res, "POST /powerbi/reports");
}

export async function updatePowerBiReport(
  reportId: number,
  input: PowerBiReportInput,
): Promise<PowerBiReport> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res, "PUT /powerbi/reports/:id");
}

export async function getPowerBiReport(reportId: number): Promise<PowerBiReport> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}`);
  return handle(res, "GET /powerbi/reports/:id");
}

export async function deletePowerBiReport(reportId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}`, { method: "DELETE" });
  await handle(res, "DELETE /powerbi/reports/:id");
}

export async function sharePowerBiReport(reportId: number): Promise<{ share_token: string | null }> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}/share`, { method: "POST" });
  return handle(res, "POST /powerbi/reports/:id/share");
}

export async function revokePowerBiShareLink(
  reportId: number,
): Promise<{ share_token: string | null }> {
  const res = await apiFetch(`${API_BASE_URL}/powerbi/reports/${reportId}/share`, {
    method: "DELETE",
  });
  return handle(res, "DELETE /powerbi/reports/:id/share");
}

export type PowerBiDatasetQueryOpts = {
  columns?: string[];
  groupBy?: string | null;
  groupBy2?: string | null;
  agg?: PowerBiAgg | null;
  limit?: number;
  filters?: PowerBiFilter[];
  dateBucket?: PowerBiDateBucket | null;
  comparePreviousPeriod?: boolean;
  formula?: PowerBiFormula | null;
  distinctColumn?: string | null;
  xColumn?: string | null;
  yColumn?: string | null;
  join?: PowerBiJoin | null;
};

function datasetQueryParams(opts: PowerBiDatasetQueryOpts): URLSearchParams {
  const params = new URLSearchParams();
  if (opts.columns?.length) params.set("columns", opts.columns.join(","));
  if (opts.groupBy) params.set("group_by", opts.groupBy);
  if (opts.groupBy2) params.set("group_by_2", opts.groupBy2);
  if (opts.agg) params.set("agg", opts.agg);
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.filters?.length) params.set("filters", JSON.stringify(opts.filters));
  if (opts.dateBucket) params.set("date_bucket", opts.dateBucket);
  if (opts.comparePreviousPeriod) params.set("compare_previous_period", "true");
  if (opts.formula) params.set("formula", JSON.stringify(opts.formula));
  if (opts.distinctColumn) params.set("distinct_column", opts.distinctColumn);
  if (opts.xColumn) params.set("x_column", opts.xColumn);
  if (opts.yColumn) params.set("y_column", opts.yColumn);
  if (opts.join) params.set("join", JSON.stringify(opts.join));
  return params;
}

export async function queryPowerBiDataset(
  datasetId: number,
  opts: PowerBiDatasetQueryOpts,
): Promise<PowerBiQueryResult> {
  const params = datasetQueryParams(opts);
  const res = await apiFetch(`${API_BASE_URL}/powerbi/datasets/${datasetId}/query?${params.toString()}`);
  return handle(res, "GET /powerbi/datasets/:id/query");
}

// --- Public "shared link" reads — no auth token required (and none sent;
// apiFetch attaches one only if a session happens to exist in this browser).

export async function getSharedPowerBiReport(token: string): Promise<PowerBiSharedReport> {
  const res = await fetch(`${API_BASE_URL}/powerbi/shared/${token}`);
  return handle(res, "GET /powerbi/shared/:token");
}

export async function querySharedPowerBiDataset(
  token: string,
  datasetId: number,
  opts: PowerBiDatasetQueryOpts,
): Promise<PowerBiQueryResult> {
  const params = datasetQueryParams(opts);
  const res = await fetch(
    `${API_BASE_URL}/powerbi/shared/${token}/datasets/${datasetId}/query?${params.toString()}`,
  );
  return handle(res, "GET /powerbi/shared/:token/datasets/:id/query");
}
