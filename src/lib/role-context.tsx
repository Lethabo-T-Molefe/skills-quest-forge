import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, type Role } from "./roles";

const STORAGE_KEY = "chieta-data-lab-role";
const DEFAULT_ROLE: Role = "System Admin";

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void } | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (ROLES as readonly string[]).includes(stored)) setRole(stored as Role);
  }, []);

  const update = (r: Role) => {
    setRole(r);
    window.localStorage.setItem(STORAGE_KEY, r);
  };

  return <RoleContext.Provider value={{ role, setRole: update }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
