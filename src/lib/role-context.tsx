import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, type Role } from "./roles";

export const ROLE_STORAGE_KEY = "chieta-data-lab-role";
const DEFAULT_ROLE: Role = "System Admin";

/** Persist the active role from outside the React tree (e.g. the sign-in page) before navigating to /app. */
export function persistRole(role: Role) {
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void } | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (stored && (ROLES as readonly string[]).includes(stored)) setRole(stored as Role);
  }, []);

  const update = (r: Role) => {
    setRole(r);
    persistRole(r);
  };

  return <RoleContext.Provider value={{ role, setRole: update }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
