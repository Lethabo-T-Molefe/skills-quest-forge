const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type QualityReport = {
  dataset_table: string;
  completeness_pct: number;
  uniqueness_pct: number;
  row_count: number;
  column_count: number;
  overall_score: number;
};

export const QUALITY_TABLES = ["grants", "learners", "skills_centres", "etqa_assessments", "providers"] as const;
export type QualityTable = (typeof QUALITY_TABLES)[number];

export async function getQualityReport(tableName: string): Promise<QualityReport> {
  const res = await fetch(`${API_BASE_URL}/datasets/quality/${tableName}`);
  if (!res.ok) throw new Error(`GET /datasets/quality/${tableName} failed: ${res.status}`);
  return res.json();
}
