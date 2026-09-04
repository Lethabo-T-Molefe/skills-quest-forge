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
