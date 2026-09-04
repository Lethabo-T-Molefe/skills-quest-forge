import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type LineageNode = {
  id: number;
  label: string;
  zone: "raw" | "cleaned" | "mart" | string;
};

export type LineageEdge = {
  source_node_id: number;
  target_node_id: number;
  transform: string;
};

export type LineageGraph = {
  pipeline: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
};

export async function getLineageGraph(pipeline: string): Promise<LineageGraph> {
  const res = await apiFetch(`${API_BASE_URL}/lineage/${encodeURIComponent(pipeline)}`);
  if (!res.ok) throw new Error(`GET /lineage/${pipeline} failed: ${res.status}`);
  return res.json();
}
