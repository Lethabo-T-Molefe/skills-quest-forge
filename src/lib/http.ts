import { clearSession, getToken } from "./auth";

/**
 * Drop-in replacement for `fetch` used by every `src/lib/api/*.ts` module.
 * Attaches the signed-in user's bearer token (if any) and, on a 401 from the
 * backend, clears the stale session and bounces to /signin — this is the one
 * place that behavior lives, instead of every call site reimplementing it.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
    if (window.location.pathname !== "/signin") {
      window.location.assign("/signin");
    }
  }

  return res;
}
