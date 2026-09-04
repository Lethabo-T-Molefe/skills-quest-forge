import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type PopiaControl = {
  id: number;
  control: string;
  status: string;
  note: string;
};

export type PiiRegisterEntry = {
  id: number;
  field: string;
  dataset: string;
  classification: string;
  action: string;
  status: string;
};

export type RetentionPolicy = {
  id: number;
  category: string;
  retention: string;
  trigger: string;
};

export type DatasetApproval = {
  id: number;
  dataset: string;
  owner: string;
  submitted: string;
  steward: string;
  status: string;
};

export async function getPopiaScorecard(): Promise<PopiaControl[]> {
  const res = await apiFetch(`${API_BASE_URL}/governance/popia-scorecard`);
  if (!res.ok) throw new Error(`GET /governance/popia-scorecard failed: ${res.status}`);
  return res.json();
}

export async function getPiiRegister(): Promise<PiiRegisterEntry[]> {
  const res = await apiFetch(`${API_BASE_URL}/governance/pii-register`);
  if (!res.ok) throw new Error(`GET /governance/pii-register failed: ${res.status}`);
  return res.json();
}

export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  const res = await apiFetch(`${API_BASE_URL}/governance/retention`);
  if (!res.ok) throw new Error(`GET /governance/retention failed: ${res.status}`);
  return res.json();
}

export async function getDatasetApprovals(): Promise<DatasetApproval[]> {
  const res = await apiFetch(`${API_BASE_URL}/governance/approvals`);
  if (!res.ok) throw new Error(`GET /governance/approvals failed: ${res.status}`);
  return res.json();
}

export async function reviewDatasetApproval(id: number, status: string): Promise<DatasetApproval> {
  const res = await apiFetch(`${API_BASE_URL}/governance/approvals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`PATCH /governance/approvals/${id} failed: ${res.status}`);
  return res.json();
}
