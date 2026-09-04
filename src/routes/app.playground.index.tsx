import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Database,
  Upload,
  Terminal,
  Notebook,
  LayoutDashboard,
  FlaskConical,
  GraduationCap,
  ScrollText,
  Code2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { UploadPanel } from "@/components/lab/upload-panel";
import { usePlaygroundServices } from "@/lib/use-playground-services";
import type { PlaygroundCatalogueService, PlaygroundServiceStatus } from "@/lib/api";
import type { Role } from "@/lib/roles";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/app/playground/")({ component: PlaygroundLanding });

const ICONS: Record<string, typeof Notebook> = {
  catalogue: Database,
  upload: Upload,
  sql: Terminal,
  jupyterhub: Notebook,
  superset: LayoutDashboard,
  mlflow: FlaskConical,
  sandbox: GraduationCap,
  audit: ScrollText,
  "code-server": Code2,
};

/** Roles that may open the restricted code-server workspace. */
const CODE_SERVER_ROLES: Role[] = ["System Admin", "Data Engineer"];

function statusTone(
  status: PlaygroundServiceStatus,
): "success" | "danger" | "muted" | "warn" | "info" {
  if (status === "up") return "success";
  if (status === "down") return "danger";
  if (status === "external") return "info";
  return "warn";
}

function statusLabel(status: PlaygroundServiceStatus): string {
  if (status === "up") return "Up";
  if (status === "down") return "Down";
  if (status === "external") return "In-app";
  return "Unknown";
}

function PlaygroundLanding() {
  const { services, isLive, isLoading } = usePlaygroundServices();
  const { role } = useRole();

  const visible = services.filter((svc) => {
    if (svc.id === "code-server") return CODE_SERVER_ROLES.includes(role);
    return true;
  });

  return (
    <>
      <PageHeader
        title="Playground"
        subtitle="Secure, browser-based CHIETA Data Lab environment — JupyterLab is the primary IDE"
        actions={
          <Badge tone={isLive ? "success" : "muted"}>
            {isLoading ? "Checking…" : isLive ? "Live status" : "Offline defaults"}
          </Badge>
        }
      />

      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload CSV, TSV, JSON or Excel — available immediately in every tool below"
      />

      <Panel
        title="Inside the playground"
        subtitle="IDEs and tools run here so data access, POPIA controls, audit trails, and student workspaces stay consistent — not on individual laptops."
      >
        <p className="text-sm text-muted-foreground">
          Primary IDE: <strong>JupyterHub / JupyterLab</strong> for analysts, scientists, and
          students. Optional restricted <strong>code-server</strong> for the technical team only.
          External IDEs connect via Git and CI/CD — they are not the main path to CHIETA datasets.
        </p>
      </Panel>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((svc) => (
          <ServiceCard key={svc.id} service={svc} />
        ))}
      </div>
    </>
  );
}

function ServiceCard({ service }: { service: PlaygroundCatalogueService }) {
  const Icon = ICONS[service.id] ?? Notebook;
  const href = service.frontend_path ?? "#";

  return (
    <div
      className={`sw-card bg-card p-5 flex flex-col gap-3 border ${
        service.is_primary_ide ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-muted grid place-items-center">
            <Icon className="size-4" />
          </div>
          <div>
            <div className="font-display font-extrabold uppercase tracking-tight text-sm">
              {service.label}
            </div>
            {service.is_primary_ide && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mt-0.5">
                Primary IDE
              </div>
            )}
          </div>
        </div>
        <Badge tone={statusTone(service.status)}>{statusLabel(service.status)}</Badge>
      </div>

      <p className="text-xs text-muted-foreground flex-1">{service.description}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          to={href as never}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"
        >
          Open <ArrowRight className="size-3.5" />
        </Link>
        {service.url && (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5"
          >
            Direct URL <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
