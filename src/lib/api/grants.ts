import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Grant = {
  id: number;
  provider: string;
  province: string;
  programme: string;
  grant_type: string;
  allocated: number;
  spent: number;
  utilisation_pct: number;
  risk: string;
  status: string;
  start_date: string;
  end_date: string;
};

export type ProvinceUtilisation = {
  province: string;
  spend: number;
  utilisation: number;
};

export type GrantFilters = {
  province?: string;
  programme?: string;
  risk?: string;
  status?: string;
};

export async function getGrants(filters: GrantFilters = {}): Promise<Grant[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const res = await apiFetch(`${API_BASE_URL}/grants${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`GET /grants failed: ${res.status}`);
  return res.json();
}

export async function getGrantUtilisationByProvince(): Promise<ProvinceUtilisation[]> {
  const res = await apiFetch(`${API_BASE_URL}/grants/utilisation`);
  if (!res.ok) throw new Error(`GET /grants/utilisation failed: ${res.status}`);
  return res.json();
}
