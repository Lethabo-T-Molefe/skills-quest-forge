import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { useJupyterUserPath } from "@/lib/use-playground-links";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/notebooks")({ component: Page });

function Page() {
  const { path, username, isLive, service } = useJupyterUserPath();
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Notebooks"
        subtitle={`JupyterHub / JupyterLab — ${ROLE_IDENTITY[role].name}'s workspace (${username})`}
      />

      <Panel
        title="JupyterLab"
        subtitle="Primary IDE — signs you straight in, no login form. Your own persistent workspace: what you save here stays here across visits."
      >
        <ServiceEmbed service={service} isLive={isLive} path={path} height="75vh" />
      </Panel>
    </>
  );
}
