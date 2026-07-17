import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { Panel, Badge } from "./panel";
import type { PlaygroundService } from "@/lib/api";

// Launches a full external service (JupyterHub, MLflow, code-server) in a
// new tab. These are full IDEs, not suited to being cramped into an iframe.
export function ServiceLauncher({
  service, isLive, cta = "Launch", children,
}: {
  service: PlaygroundService;
  isLive: boolean;
  cta?: string;
  children?: ReactNode;
}) {
  return (
    <Panel title={service.label} subtitle={service.description} action={
      <Badge tone={isLive ? "success" : "muted"}>{isLive ? "Connected" : "Default URL"}</Badge>
    }>
      <div className="flex flex-col gap-4">
        {children}
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm px-4 py-2.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-2 font-medium"
        >
          {cta} <ExternalLink className="size-3.5" />
        </a>
        <div className="text-xs text-muted-foreground font-mono">{service.url}</div>
      </div>
    </Panel>
  );
}
