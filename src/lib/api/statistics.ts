const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type StatCategory = {
  id: string;
  name: string;
  main_question: string;
  purpose: string;
  methods: string[];
};

export type AnalysisOutput = {
  type: "stream" | "result" | "image" | "error";
  text: string | null;
  image_base64: string | null;
};

export type AnalysisSection = {
  method: string;
  reasoning: string;
  code: string;
  formula: string;
  outputs: AnalysisOutput[];
  interpretation: string;
  status: "ok" | "error";
};

export type AnalysisResult = {
  category_id: string;
  dataset_table: string;
  overview: AnalysisSection | null;
  sections: AnalysisSection[];
  consolidated_script: string;
  final_findings: string;
};

export async function getTaxonomy(): Promise<StatCategory[]> {
  const res = await fetch(`${API_BASE_URL}/statistics/taxonomy`);
  if (!res.ok) throw new Error(`GET /statistics/taxonomy failed: ${res.status}`);
  return res.json();
}

export async function runAnalysis(
  categoryId: string,
  table: string,
  methods: string[]
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/statistics/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_id: categoryId, table, methods }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /statistics/analyze failed: ${res.status}`);
  }
  return res.json();
}
