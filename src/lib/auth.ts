import type { Role } from "./roles";

const SESSION_STORAGE_KEY = "chieta-data-lab-session";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
};

export type StoredSession = {
  token: string;
  user: SessionUser;
};

/** Reads the persisted session (JWT + user) from localStorage, if any and well-formed. */
export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token || !parsed?.user?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist a session outside the React tree (e.g. from the sign-in page) before navigating to /app. */
export function persistSession(session: StoredSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getToken(): string | null {
  return getStoredSession()?.token ?? null;
}
