const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type ChartSuggestion = {
  type: "bar" | "donut" | "table";
  x: string | null;
  keys: string[];
};

export type AskResult = {
  question: string;
  sql: string;
  explanation: string;
  confidence: "high" | "low";
  columns: string[];
  rows: unknown[][];
  chart: ChartSuggestion;
};

export type HistoryItem = {
  id: number;
  question: string;
  sql: string;
  explanation: string;
  confidence: "high" | "low";
  created_at: string;
};

export async function askQuestion(question: string): Promise<AskResult> {
  const res = await fetch(`${API_BASE_URL}/ai-analyst/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /ai-analyst/ask failed: ${res.status}`);
  }
  return res.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/ai-analyst/history`);
  if (!res.ok) throw new Error(`GET /ai-analyst/history failed: ${res.status}`);
  return res.json();
}
