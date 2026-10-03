/**
 * The HTTP client for the DataForge API.
 *
 * The access token lives in memory only. The refresh token never reaches this code: the API keeps it in
 * an HttpOnly cookie for its auth endpoints, rotates it on every refresh and revokes the whole session if
 * an old one is replayed. Local storage only remembers that a session exists, so a reload knows to ask
 * for a new access token. A 401 triggers one shared refresh, then the request is retried once.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

/** A marker, not a secret: "this browser signed in". */
const SESSION_KEY = "dataforge.session";
/** Where the refresh token was kept before it moved to a cookie. Read once, then removed. */
const LEGACY_REFRESH_KEY = "dataforge.refresh";

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

function readStored(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function markSession(active: boolean) {
  try {
    if (active) localStorage.setItem(SESSION_KEY, "1");
    else localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
}

/** A new session's access token. Its refresh token arrived as an HttpOnly cookie. */
export interface SessionTokens {
  accessToken: string;
}

export function storeTokens(tokens: SessionTokens) {
  accessToken = tokens.accessToken;
  markSession(true);
}

export function clearTokens() {
  accessToken = null;
  markSession(false);
  sessionListeners.forEach((listener) => listener());
}

function mayResume() {
  return readStored(SESSION_KEY) !== null || readStored(LEGACY_REFRESH_KEY) !== null;
}

/** Whether this browser holds a session that can be resumed. */
export function hasSession() {
  return accessToken !== null || mayResume();
}

/** Called when the session ends (sign-out, or a refresh the API refused). */
export function onSessionEnd(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

async function refreshSession(): Promise<boolean> {
  if (!mayResume()) return false;
  // A session from before the cookie existed hands its stored token over once; the API answers with a cookie.
  const legacy = readStored(LEGACY_REFRESH_KEY);
  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(legacy ? { refreshToken: legacy } : {}),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      storeTokens((await response.json()) as SessionTokens);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function errorFrom(status: number, text: string, statusText: string): ApiError {
  try {
    const body = JSON.parse(text) as {
      error?: { code?: string; message?: string; details?: Record<string, unknown> };
    };
    const error = body.error ?? {};
    return new ApiError(
      status,
      error.code ?? "error",
      error.message ?? statusText,
      error.details ?? {},
    );
  } catch {
    return new ApiError(status, "error", statusText || "The request failed.");
  }
}

async function toError(response: Response): Promise<ApiError> {
  return errorFrom(response.status, await response.text().catch(() => ""), response.statusText);
}

const UNREACHABLE = "The DataForge service cannot be reached. Check your connection and try again.";

/**
 * How far an upload has got: a fraction from 0 to 1 while the file is sent, then null while the API
 * reads, scans and profiles it.
 */
export type UploadProgress = (sent: number | null) => void;

function postWithProgress(path: string, form: FormData, onProgress?: UploadProgress) {
  return new Promise<{ status: number; text: string; statusText: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}${path}`);
    request.withCredentials = true;
    request.setRequestHeader("Accept", "application/json");
    if (accessToken) request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    request.upload.onload = () => onProgress?.(null);
    request.onload = () =>
      resolve({
        status: request.status,
        text: request.responseText,
        statusText: request.statusText,
      });
    request.onerror = () => reject(new ApiError(0, "network", UNREACHABLE));
    request.send(form);
  });
}

type Body = FormData | object | undefined;

async function send(method: string, path: string, body: Body, retry = true): Promise<Response> {
  if (!accessToken && retry && mayResume()) await refreshSession();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  // Credentials let the auth endpoints set and read the session cookie across the app's and API's ports.
  const init: RequestInit = { method, headers, credentials: "include" };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "network", UNREACHABLE);
  }
  if (response.status === 401 && retry && mayResume()) {
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
  /** POST a form with a file, reporting how much of it has been sent (fetch cannot). */
  async upload<T>(path: string, form: FormData, onProgress?: UploadProgress): Promise<T> {
    if (!accessToken && mayResume()) await refreshSession();
    let result = await postWithProgress(path, form, onProgress);
    if (result.status === 401 && mayResume()) {
      accessToken = null;
      if (await refreshSession()) result = await postWithProgress(path, form, onProgress);
    }
    if (result.status < 200 || result.status >= 300) {
      throw errorFrom(result.status, result.text, result.statusText);
    }
    return JSON.parse(result.text) as T;
  },
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
