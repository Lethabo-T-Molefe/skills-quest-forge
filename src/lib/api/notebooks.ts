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

export type Language = {
  id: string;
  kernel_name: string;
};

export type SavedCell = {
  code: string;
  outputs: ExecutionOutput[];
  execution_count: number | null;
  status: "idle" | "running" | "ok" | "error";
};

export type NotebookSummary = {
  id: number;
  name: string;
  language: string;
  updated_at: string;
};

export type SavedNotebook = NotebookSummary & {
  cells: SavedCell[];
};

export async function getLanguages(): Promise<Language[]> {
  const res = await fetch(`${API_BASE_URL}/notebooks/languages`);
  if (!res.ok) throw new Error(`GET /notebooks/languages failed: ${res.status}`);
  return res.json();
}

export async function startSession(language = "python"): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/notebooks/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /notebooks/sessions failed: ${res.status}`);
  }
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

// Uploads a raw file straight into the kernel's own working directory, so a
// cell can open it by plain filename (pd.read_csv("name.csv")) exactly like
// real Jupyter — no SQL/warehouse round-trip needed just to read a file back.
export async function uploadFileToSession(sessionId: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE_URL}/notebooks/sessions/${sessionId}/files`, {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /notebooks/sessions/${sessionId}/files failed: ${res.status}`);
  }
  const result = await res.json();
  return result.filename;
}

export async function stopSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notebooks/sessions/${sessionId}`, { method: "DELETE" });
}

export async function saveNotebook(
  notebook: { id?: number | null; name: string; language: string; cells: SavedCell[] }
): Promise<SavedNotebook> {
  const res = await fetch(`${API_BASE_URL}/notebooks/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notebook),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /notebooks/files failed: ${res.status}`);
  }
  return res.json();
}

export async function listNotebooks(): Promise<NotebookSummary[]> {
  const res = await fetch(`${API_BASE_URL}/notebooks/files`);
  if (!res.ok) throw new Error(`GET /notebooks/files failed: ${res.status}`);
  return res.json();
}

export async function getNotebook(id: number): Promise<SavedNotebook> {
  const res = await fetch(`${API_BASE_URL}/notebooks/files/${id}`);
  if (!res.ok) throw new Error(`GET /notebooks/files/${id} failed: ${res.status}`);
  return res.json();
}

export async function deleteNotebook(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/notebooks/files/${id}`, { method: "DELETE" });
}
