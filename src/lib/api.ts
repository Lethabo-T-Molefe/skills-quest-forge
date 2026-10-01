/**
 * The HTTP client for the DataForge API.
 *
 * The access token lives in memory only. The refresh token is kept in local storage so a reload keeps the
 * session; the API rotates it on every refresh and revokes the whole session if an old one is replayed.
 * A 401 triggers one shared refresh, then the request is retried once.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const REFRESH_KEY = "dataforge.refresh";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** The API's own suggestion for what to do next, when it gives one. */
  get suggestion(): string | undefined {
    const value = this.details["suggestion"];
    return typeof value === "string" ? value : undefined;
  }
}

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
const sessionListeners = new Set<() => void>();

function readRefresh() {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefresh(value: string | null) {
  try {
    if (value) localStorage.setItem(REFRESH_KEY, value);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function storeTokens(tokens: TokenPair) {
  accessToken = tokens.accessToken;
  writeRefresh(tokens.refreshToken);
}

export function clearTokens() {
  accessToken = null;
  writeRefresh(null);
  sessionListeners.forEach((listener) => listener());
}

/** Whether this browser holds a session that can be resumed. */
export function hasSession() {
  return accessToken !== null || readRefresh() !== null;
}

export function currentRefreshToken() {
  return readRefresh();
}

/** Called when the session ends (sign-out, or a refresh the API refused). */
export function onSessionEnd(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

async function refreshSession(): Promise<boolean> {
  const token = readRefresh();
  if (!token) return false;
  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token }),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      storeTokens((await response.json()) as TokenPair);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function toError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; details?: Record<string, unknown> };
    };
    const error = body.error ?? {};
    return new ApiError(
      response.status,
      error.code ?? "error",
      error.message ?? response.statusText,
      error.details ?? {},
    );
  } catch {
    return new ApiError(response.status, "error", response.statusText || "The request failed.");
  }
}

type Body = FormData | object | undefined;

async function send(method: string, path: string, body: Body, retry = true): Promise<Response> {
  if (!accessToken && retry && readRefresh()) await refreshSession();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const init: RequestInit = { method, headers };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "network",
      "The DataForge service cannot be reached. Check your connection and try again.",
    );
  }
  if (response.status === 401 && retry && readRefresh()) {
    accessToken = null;
    if (await refreshSession()) return send(method, path, body, false);
  }
  if (!response.ok) throw await toError(response);
  return response;
}

async function json<T>(method: string, path: string, body?: Body): Promise<T> {
  const response = await send(method, path, body);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => json<T>("GET", path),
  post: <T>(path: string, body?: Body) => json<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: Body) => json<T>("PUT", path, body ?? {}),
  patch: <T>(path: string, body?: Body) => json<T>("PATCH", path, body ?? {}),
  delete: <T = void>(path: string) => json<T>("DELETE", path),
  /** Download a file the API produces (an export) and hand it to the browser. */
  async download(path: string, fallbackName: string) {
    const response = await send("GET", path, undefined);
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const name = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? fallbackName;
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  },
};

/** Build a query string, leaving out empty values. */
export function query(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** A message for a person: the API's own words when it gave any, otherwise a plain fallback. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
  if (error instanceof ApiError)
    return error.suggestion ? `${error.message} ${error.suggestion}` : error.message;
  return fallback;
}
