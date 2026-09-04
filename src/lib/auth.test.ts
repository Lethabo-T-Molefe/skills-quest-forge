import { afterEach, describe, expect, it } from "vitest";
import { clearSession, getStoredSession, getToken, persistSession, type StoredSession } from "./auth";

const SESSION_KEY = "chieta-data-lab-session";

const sampleSession: StoredSession = {
  token: "abc.def.ghi",
  user: { id: 1, name: "T. Mokoena", email: "t.mokoena@chieta.org.za", role: "System Admin", is_active: true },
};

describe("session storage", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("round-trips a persisted session", () => {
    persistSession(sampleSession);
    expect(getStoredSession()).toEqual(sampleSession);
    expect(getToken()).toBe("abc.def.ghi");
  });

  it("clearSession removes the stored session", () => {
    persistSession(sampleSession);
    clearSession();
    expect(getStoredSession()).toBeNull();
  });

  it("treats malformed JSON as no session, not a crash", () => {
    window.localStorage.setItem(SESSION_KEY, "{not json");
    expect(getStoredSession()).toBeNull();
  });

  it("treats a session missing token/role as invalid", () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: { role: "System Admin" } }));
    expect(getStoredSession()).toBeNull();

    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ token: "x", user: {} }));
    expect(getStoredSession()).toBeNull();
  });
});
