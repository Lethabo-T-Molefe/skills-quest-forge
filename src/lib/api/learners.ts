const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type LearnerCohort = {
  id: number;
  cohort: string;
  programme: string;
  province: string;
  enrolled: number;
  predicted: number;
  risk: string;
  confidence: number;
};

export type EnrolmentTrendPoint = {
  month: string;
  enrolled: number;
  completed: number;
};

export type LearnerCohortFilters = {
  programme?: string;
  province?: string;
  risk?: string;
};

export async function getLearnerCohorts(
  filters: LearnerCohortFilters = {}
): Promise<LearnerCohort[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/learners/cohorts${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`GET /learners/cohorts failed: ${res.status}`);
  return res.json();
}

export async function getEnrolmentTrend(): Promise<EnrolmentTrendPoint[]> {
  const res = await fetch(`${API_BASE_URL}/learners/enrolment-trend`);
  if (!res.ok) throw new Error(`GET /learners/enrolment-trend failed: ${res.status}`);
  return res.json();
}
