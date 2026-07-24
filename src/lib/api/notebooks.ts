const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type ExecutionOutput = {
  type: "stream" | "result" | "error" | "image";
  text: string | null;
  image_base64: string | null;
};

export type ExecutionResult = {
  outputs: ExecutionOutput[];
  status: "ok" | "error";
  execution_count: number;
};

export async function startSession(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/notebooks/sessions`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /notebooks/sessions failed: ${res.status}`);
  const body = await res.json();
  return body.session_id;
}

export async function executeCell(sessionId: string, code: string): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE_URL}/notebooks/sessions/${sessionId}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /notebooks/sessions/${sessionId}/execute failed: ${res.status}`);
  }
  return res.json();
}

export async function stopSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notebooks/sessions/${sessionId}`, { method: "DELETE" });
}
