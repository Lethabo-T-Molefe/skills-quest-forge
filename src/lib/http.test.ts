import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./http";
import { getStoredSession, persistSession, type StoredSession } from "./auth";

const sampleSession: StoredSession = {
  token: "signed.jwt.token",
  user: { id: 1, name: "T. Mokoena", email: "t.mokoena@chieta.org.za", role: "System Admin", is_active: true },
};

function okResponse() {
  return { ok: true, status: 200, json: async () => ({}) } as Response;
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("sends no Authorization header when no session is stored", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("http://localhost:8000/api/v1/datasets");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
  });

  it("attaches the stored bearer token to every request", async () => {
    persistSession(sampleSession);
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("http://localhost:8000/api/v1/datasets");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer signed.jwt.token");
  });

  it("does not overwrite an explicitly-provided Authorization header", async () => {
    persistSession(sampleSession);
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("http://localhost:8000/api/v1/datasets", {
      headers: { Authorization: "Bearer explicit-token" },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer explicit-token");
  });

  it("clears the session and redirects to /signin on a 401", async () => {
    persistSession(sampleSession);
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) } as Response);
    vi.stubGlobal("fetch", fetchMock);
    const assign = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, assign }, writable: true });

    await apiFetch("http://localhost:8000/api/v1/datasets");

    expect(getStoredSession()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/signin");
  });

  it("leaves a valid session untouched on a non-401 response", async () => {
    persistSession(sampleSession);
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);
    vi.stubGlobal("fetch", fetchMock);
    const assign = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, assign }, writable: true });

    await apiFetch("http://localhost:8000/api/v1/datasets");

    expect(getStoredSession()).not.toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });
});
