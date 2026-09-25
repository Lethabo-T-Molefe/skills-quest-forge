import { demoUser, roleLabels } from "../constants";
import type { CurrentUser, RoleId } from "../types";

const KEY = "dataforge.session";

export function getSession(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setSession(user: CurrentUser) {
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}

export function signInDemo() {
  setSession(demoUser);
  return demoUser;
}

export function applyRole(roleId: RoleId) {
  const current = getSession() ?? demoUser;
  const next: CurrentUser = {
    ...current,
    roleId,
    role: roleLabels[roleId],
  };
  setSession(next);
  return next;
}

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
