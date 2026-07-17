const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type SkillsCentre = {
  id: number;
  centre_id: string;
  name: string;
  province: string;
  capacity: number;
  current_enrolment: number;
  utilisation_pct: number;
  operational_status: string;
  opened_date: string;
};

export type ProvinceCentreUtilisation = {
  province: string;
  avg_utilisation: number;
};

export type SkillsCentreFilters = {
  province?: string;
  status?: string;
};

export async function getSkillsCentres(
  filters: SkillsCentreFilters = {}
): Promise<SkillsCentre[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/centres${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`GET /centres failed: ${res.status}`);
  return res.json();
}

export async function getCentreUtilisationHeatmap(): Promise<ProvinceCentreUtilisation[]> {
  const res = await fetch(`${API_BASE_URL}/centres/utilisation`);
  if (!res.ok) throw new Error(`GET /centres/utilisation failed: ${res.status}`);
  return res.json();
}
