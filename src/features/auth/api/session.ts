import {
  api,
  clearTokens,
  currentRefreshToken,
  hasSession,
  storeTokens,
  type TokenPair,
} from "@/lib/api";
import type { CurrentUser, RoleId } from "../types";

const MFA_KEY = "dataforge.mfa-challenge";
const PENDING_EMAIL_KEY = "dataforge.pending-email";

interface SessionResponse extends TokenPair {
  user: CurrentUser;
}

type LoginResponse =
  ({ mfaRequired: false } & SessionResponse) | { mfaRequired: true; challengeToken: string };

/** Whether this browser holds a session (checked synchronously by the router). */
export function getSession() {
  return hasSession();
}

/** Password sign-in. Resolves to "mfa" when a second factor is still needed. */
export async function signIn(email: string, password: string): Promise<"signed-in" | "mfa"> {
  const result = await api.post<LoginResponse>("/auth/login", { email, password });
  if (result.mfaRequired) {
    sessionStorage.setItem(MFA_KEY, result.challengeToken);
    return "mfa";
  }
  storeTokens(result);
  return "signed-in";
}

export function hasMfaChallenge() {
  return sessionStorage.getItem(MFA_KEY) !== null;
}

export async function completeMfa(code: string): Promise<CurrentUser> {
  const challengeToken = sessionStorage.getItem(MFA_KEY);
  if (!challengeToken) throw new Error("Sign in again to get a new challenge.");
  try {
    const result = await api.post<SessionResponse>("/auth/mfa", {
      challengeToken,
      code: code.replace(/\s/g, ""),
    });
    storeTokens(result);
    return result.user;
  } finally {
    // A challenge works once: a wrong code blocks it, and the member signs in again.
    sessionStorage.removeItem(MFA_KEY);
  }
}

/** Demo workspaces only (the API must run with DEMO_MODE): sign in as the seeded member for a role. */
export async function signInDemo(role: RoleId = "analyst"): Promise<CurrentUser> {
  const result = await api.post<SessionResponse>("/auth/demo", { role });
  storeTokens(result);
  return result.user;
}

export async function demoAvailable() {
  try {
    return (await api.get<{ enabled: boolean }>("/auth/demo")).enabled;
  } catch {
    return false;
  }
}

export async function register(name: string, email: string, password: string) {
  await api.post("/auth/register", { name, email, password });
  sessionStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function pendingEmail() {
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export async function verifyEmail(token: string) {
  return api.post<{ verified: boolean; email: string }>("/auth/verify-email", { token });
}

export async function resendVerification(email: string) {
  await api.post("/auth/resend-verification", { email });
}

export async function signOut() {
  try {
    await api.post("/auth/logout", { refreshToken: currentRefreshToken() });
  } catch {
    // The local session ends whatever the API says.
  } finally {
    clearTokens();
  }
}

export async function startMfaSetup() {
  return api.post<{ secret: string; otpauthUri: string }>("/auth/mfa/setup");
}

export async function enableMfa(code: string) {
  await api.post("/auth/mfa/enable", { code });
}

export async function disableMfa(password: string, code: string) {
  await api.post("/auth/mfa/disable", { password, code: code.replace(/\s/g, "") });
}

/** Changing the password signs out every session, including this one. */
export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post("/auth/password", { currentPassword, newPassword });
}

/** Ask for a reset link. The API answers the same way whether or not the address has an account. */
export async function forgotPassword(email: string) {
  await api.post("/auth/forgot-password", { email });
}

/** Choose a new password with the token from a reset or invitation email. */
export async function resetPassword(token: string, password: string) {
  await api.post("/auth/reset-password", { token, password });
}

export async function createSlackLinkCode() {
  return api.post<{ code: string; expiresInMinutes: number; instruction: string }>(
    "/auth/slack-link",
  );
}

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
