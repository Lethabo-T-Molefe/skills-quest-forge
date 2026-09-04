import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "./roles";
import { clearSession, getStoredSession, type SessionUser } from "./auth";

/** Least-privilege fallback — used only if a corrupt/partial session slips past the route guard. */
const DEFAULT_ROLE: Role = "Viewer / Exec";

type RoleContextValue = {
  role: Role;
  user: SessionUser | null;
  token: string | null;
  /** Clears the session and forces a re-render; callers still navigate to /signin themselves. */
  signOut: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => getStoredSession());

  function signOut() {
    clearSession();
    setSession(null);
  }

  const value: RoleContextValue = {
    role: (session?.user.role as Role | undefined) ?? DEFAULT_ROLE,
    user: session?.user ?? null,
    token: session?.token ?? null,
    signOut,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
