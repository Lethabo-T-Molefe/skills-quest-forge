import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type AuditLogEntry = {
  id: number;
  ts: string;
  user: string;
  action: string;
  obj: string;
  name: string;
  ip: string;
  status: string;
};

export type AuditLogFilters = {
  user?: string;
  action?: string;
  status?: string;
};

export async function getAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const res = await apiFetch(`${API_BASE_URL}/audit${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`GET /audit failed: ${res.status}`);
  return res.json();
}
