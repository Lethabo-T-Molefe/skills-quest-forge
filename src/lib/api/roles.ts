const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type RoleInfo = {
  role: string;
  blurb: string;
};

export type RolePermission = {
  permission: string;
  granted: boolean;
};

export async function getRoles(): Promise<RoleInfo[]> {
  const res = await fetch(`${API_BASE_URL}/roles`);
  if (!res.ok) throw new Error(`GET /roles failed: ${res.status}`);
  return res.json();
}

export async function getRolePermissions(role: string): Promise<RolePermission[]> {
  const res = await fetch(`${API_BASE_URL}/roles/${encodeURIComponent(role)}/permissions`);
  if (!res.ok) throw new Error(`GET /roles/${role}/permissions failed: ${res.status}`);
  return res.json();
}
