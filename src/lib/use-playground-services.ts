import { useQuery } from "@tanstack/react-query";
import {
  getPlaygroundServices,
  type PlaygroundCatalogueService,
} from "./api";

/** Static catalogue used when the backend is unreachable (local UI still works). */
const FALLBACK_SERVICES: PlaygroundCatalogueService[] = [
  {
    id: "catalogue",
    label: "Data Catalogue",
    description: "Search and browse classified datasets with quality scores.",
    url: null,
    frontend_path: "/app/datasets",
    category: "data",
    is_primary_ide: false,
    status: "external",
  },
  {
    id: "upload",
    label: "Dataset Upload Area",
    description: "CSV/Excel upload with POPIA classification step.",
    url: null,
    frontend_path: "/app/upload",
    category: "data",
    is_primary_ide: false,
    status: "external",
  },
  {
    id: "sql",
    label: "SQL Workspace",
    description: "Superset SQL Lab for technical query work on approved data.",
    url: import.meta.env.VITE_SUPERSET_URL ?? "http://localhost:8088",
    frontend_path: "/app/playground/superset",
    category: "analytics",
    is_primary_ide: false,
    status: "unknown",
  },
  {
    id: "jupyterhub",
    label: "JupyterHub / JupyterLab",
    description:
      "Primary IDE — per-user JupyterLab workspaces for analysts, scientists, and students.",
    url: import.meta.env.VITE_JUPYTERHUB_URL ?? "http://localhost:8100",
    frontend_path: "/app/playground/jupyter",
    category: "ide",
    is_primary_ide: true,
    status: "unknown",
  },
  {
    id: "superset",
    label: "Superset Dashboards",
    description: "Interactive dashboards and visual analytics.",
    url: import.meta.env.VITE_SUPERSET_URL ?? "http://localhost:8088",
    frontend_path: "/app/playground/superset",
    category: "dashboards",
    is_primary_ide: false,
    status: "unknown",
  },
  {
    id: "mlflow",
    label: "MLflow Experiments",
    description: "Experiment tracking and model registry.",
    url: import.meta.env.VITE_MLFLOW_URL ?? "http://localhost:5000",
    frontend_path: "/app/playground/mlflow",
    category: "ml",
    is_primary_ide: false,
    status: "unknown",
  },
  {
    id: "sandbox",
    label: "Student Sandbox",
    description: "Controlled JupyterHub workspace for student co-development.",
    url: import.meta.env.VITE_JUPYTERHUB_URL ?? "http://localhost:8100",
    frontend_path: "/app/playground/sandbox",
    category: "sandbox",
    is_primary_ide: false,
    status: "unknown",
  },
  {
    id: "audit",
    label: "Admin / Audit Logs",
    description: "Immutable access and action log (POPIA §14).",
    url: null,
    frontend_path: "/app/audit",
    category: "admin",
    is_primary_ide: false,
    status: "external",
  },
  {
    id: "code-server",
    label: "Developer Workspace (code-server)",
    description:
      "Restricted VS Code in the browser for the technical team — not a replacement for JupyterLab.",
    url: import.meta.env.VITE_CODE_SERVER_URL ?? "http://localhost:8443",
    frontend_path: "/app/playground/code",
    category: "dev",
    is_primary_ide: false,
    status: "unknown",
  },
];

export function usePlaygroundServices() {
  const query = useQuery({
    queryKey: ["playground-services"],
    queryFn: getPlaygroundServices,
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    services: query.data ?? FALLBACK_SERVICES,
    isLive: query.isSuccess,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
