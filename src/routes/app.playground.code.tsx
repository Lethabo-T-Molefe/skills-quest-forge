import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/playground/code")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader
        title="Developer Workspace"
        subtitle="code-server — restricted technical team only"
        actions={<Badge tone="warn">Restricted</Badge>}
      />
      <Panel
        title="code-server"
        subtitle="Browser VS Code for backend, frontend, and DevOps — not a replacement for JupyterLab."
      >
        <ServiceEmbed service={links.codeServer} isLive={isLive} height="75vh" />
      </Panel>
    </>
  );
}
