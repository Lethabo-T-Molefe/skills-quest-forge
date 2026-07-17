import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { ServiceLauncher } from "@/components/lab/service-launcher";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/dev-workspace")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader title="Developer Workspace" subtitle="code-server — restricted, technical team only" actions={
        <Badge tone="warn">Restricted</Badge>
      } />

      <ServiceLauncher service={links.codeServer} isLive={isLive} cta="Open code-server">
        <p className="text-sm text-muted-foreground">
          A browser-based VS Code for backend, frontend, and DevOps work — <strong>not a
          replacement for JupyterLab</strong>. Use this for repo-level engineering tasks;
          use Notebooks for data science and analysis.
        </p>
      </ServiceLauncher>

      <Panel title="Who has access">
        <p className="text-sm text-muted-foreground">
          Limited to System Admin and Data Engineer roles. External IDEs on personal laptops
          may still connect via Git and approved CI/CD, but this browser workspace is the
          controlled path for working with CHIETA infrastructure.
        </p>
      </Panel>
    </>
  );
}
