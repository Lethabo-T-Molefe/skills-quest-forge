import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { useJupyterUserPath } from "@/lib/use-playground-links";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/playground/jupyter")({ component: Page });

function Page() {
  const { path, username, isLive, service } = useJupyterUserPath();
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="JupyterHub / JupyterLab"
        subtitle={`Primary IDE — ${ROLE_IDENTITY[role].name}'s workspace (${username})`}
      />
      <Panel
        title="JupyterLab"
        subtitle="Isolated, persistent per-user notebook environment for data science, SQL, ML, and experimentation."
      >
        <ServiceEmbed service={service} isLive={isLive} path={path} height="75vh" />
      </Panel>
    </>
  );
}
