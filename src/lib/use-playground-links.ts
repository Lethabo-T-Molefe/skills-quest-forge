import { useQuery } from "@tanstack/react-query";
import { getPlaygroundLinks, type PlaygroundLinks } from "./api";
import { useRole } from "./role-context";
import { ROLE_IDENTITY } from "./roles";

const FALLBACK_LINKS: PlaygroundLinks = {
  jupyterhub: {
    url: import.meta.env.VITE_JUPYTERHUB_URL ?? "http://localhost:8100",
    label: "JupyterHub / JupyterLab",
    description: "Primary IDE — isolated, persistent per-user workspace.",
  },
  superset: {
    url: import.meta.env.VITE_SUPERSET_URL ?? "http://localhost:8088",
    label: "Superset",
    description: "Dashboards and the SQL Workspace (SQL Lab).",
  },
  mlflow: {
    url: import.meta.env.VITE_MLFLOW_URL ?? "http://localhost:5000",
    label: "MLflow",
    description: "Experiment tracking and model registry.",
  },
  codeServer: {
    url: import.meta.env.VITE_CODE_SERVER_URL ?? "http://localhost:8443",
    label: "code-server",
    description: "Restricted developer workspace for the technical team.",
  },
};

// Falls back to VITE_* env defaults when the backend isn't reachable, so
// Playground pages stay usable in local dev without the API running.
export function usePlaygroundLinks() {
  const query = useQuery({
    queryKey: ["playground-links"],
    queryFn: getPlaygroundLinks,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    links: query.data ?? FALLBACK_LINKS,
    isLive: query.isSuccess,
    isLoading: query.isLoading,
  };
}

// Turns a CHIETA identity's email into a safe JupyterHub/Linux username, e.g.
// "s.naidoo@chieta.org.za" -> "s-naidoo". Every CHIETA identity gets its own
// persistent, isolated JupyterLab workspace keyed off this slug.
export function slugifyUsername(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/@.*/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "chieta";
}

// The JupyterHub path for the *current* CHIETA identity's own workspace —
// auto-authenticates (no login form) as their username and goes straight to
// their persistent JupyterLab. Pass as `path` to ServiceEmbed/ServiceLauncher.
//
// `next` must be /hub/spawn/<user>, not /user/<user>/lab directly: JupyterHub
// 4.1 requires spawns to go through an XSRF-protected POST (normally fired by
// the Hub's own client-side JS after a button click), so a bare top-level GET
// straight to /user/<user>/lab 424s on first visit. GET /hub/spawn/<user> has
// no options form configured, so it triggers the spawn itself and redirects
// into the running server once ready — safe for both first-time and
// already-running visits (it just redirects straight through in the latter).
export function useJupyterUserPath() {
  const { links, isLive } = usePlaygroundLinks();
  const { role } = useRole();
  const username = slugifyUsername(ROLE_IDENTITY[role].email);
  const next = encodeURIComponent(`/hub/spawn/${username}`);
  const path = `/hub/login?user=${username}&next=${next}`;
  return { path, username, isLive, service: links.jupyterhub };
}
