import type { StoredSession } from "@/lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

/** Real login — POSTs to the backend, which verifies a bcrypt hash and issues a JWT. */
export async function login(email: string, password: string): Promise<StoredSession> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `POST /auth/login failed: ${res.status}`);
  }
  const data = await res.json();
  return { token: data.access_token, user: data.user };
}

/** Best-effort server-side logout audit record; the client discards its token regardless. */
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    // Logging out is best-effort — the client clears its own session either way.
  });
}
