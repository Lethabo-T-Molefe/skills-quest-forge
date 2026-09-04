import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type PlaygroundServiceLink = {
  url: string;
  label: string;
  description: string;
};

/** @deprecated Prefer PlaygroundServiceLink; kept for existing embeds. */
export type PlaygroundService = PlaygroundServiceLink;

export type PlaygroundLinks = {
  jupyterhub: PlaygroundServiceLink;
  superset: PlaygroundServiceLink;
  mlflow: PlaygroundServiceLink;
  codeServer: PlaygroundServiceLink;
};

export type PlaygroundServiceStatus = "up" | "down" | "unknown" | "external";

export type PlaygroundCatalogueService = {
  id: string;
  label: string;
  description: string;
  url: string | null;
  frontend_path: string | null;
  category: string;
  is_primary_ide: boolean;
  status: PlaygroundServiceStatus;
};

export async function getPlaygroundLinks(): Promise<PlaygroundLinks> {
  const res = await apiFetch(`${API_BASE_URL}/playground/links`);
  if (!res.ok) throw new Error(`GET /playground/links failed: ${res.status}`);
  return res.json();
}

export async function getPlaygroundServices(): Promise<PlaygroundCatalogueService[]> {
  const res = await apiFetch(`${API_BASE_URL}/playground/services`);
  if (!res.ok) throw new Error(`GET /playground/services failed: ${res.status}`);
  return res.json();
}

export type DatasetColumn = {
  name: string;
  data_type: string;
};

export type Dataset = {
  id: number;
  name: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  row_count: number;
  column_count: number;
  warehouse_schema: string;
  warehouse_table: string;
  columns: DatasetColumn[];
  owner: string | null;
  description: string;
  tags: string[];
  classification: string;
  version: number;
  previous_version_id: number | null;
  masked_columns: string[];
};

export async function listDatasets(search?: string): Promise<Dataset[]> {
  const url = new URL(`${API_BASE_URL}/datasets`);
  if (search) url.searchParams.set("search", search);
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`GET /datasets failed: ${res.status}`);
  return res.json();
}

export async function getDataset(id: number): Promise<Dataset> {
  const res = await apiFetch(`${API_BASE_URL}/datasets/${id}`);
  if (!res.ok) throw new Error(`GET /datasets/${id} failed: ${res.status}`);
  return res.json();
}

export async function uploadDataset(
  file: File,
  name: string,
  options?: { description?: string; tags?: string[]; classification?: string }
): Promise<Dataset> {
  const body = new FormData();
  body.append("file", file);
  body.append("name", name);
  if (options?.description) body.append("description", options.description);
  if (options?.tags?.length) body.append("tags", options.tags.join(","));
  if (options?.classification) body.append("classification", options.classification);
  const res = await apiFetch(`${API_BASE_URL}/datasets/upload`, { method: "POST", body });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /datasets/upload failed: ${res.status}`);
  }
  return res.json();
}
