import { apiFetch } from "@/lib/http";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
  last_login_at: string | null;
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: string;
};

export async function getUsers(): Promise<User[]> {
  const res = await apiFetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error(`GET /users failed: ${res.status}`);
  return res.json();
}

export async function getUser(id: number): Promise<User> {
  const res = await apiFetch(`${API_BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error(`GET /users/${id} failed: ${res.status}`);
  return res.json();
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await apiFetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /users failed: ${res.status}`);
  return res.json();
}

export async function assignUserRole(id: number, role: string): Promise<User> {
  const res = await apiFetch(`${API_BASE_URL}/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`PATCH /users/${id}/role failed: ${res.status}`);
  return res.json();
}

// Soft-delete: deactivates the user (sets is_active=false); no row is removed.
export async function deactivateUser(id: number): Promise<User> {
  const res = await apiFetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /users/${id} failed: ${res.status}`);
  return res.json();
}
