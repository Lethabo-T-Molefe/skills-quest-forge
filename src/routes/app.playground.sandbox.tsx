import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { useJupyterUserPath } from "@/lib/use-playground-links";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/playground/sandbox")({ component: Page });

function Page() {
  const { path, username, isLive, service } = useJupyterUserPath();
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Student Sandbox"
        subtitle={`Controlled JupyterHub workspace — ${ROLE_IDENTITY[role].name} (${username})`}
        actions={<Badge tone="info">Sandbox</Badge>}
      />
      <Panel
        title="Student co-development space"
        subtitle="Same primary IDE (JupyterLab), scoped for student contributors with audit-friendly isolation."
      >
        <ServiceEmbed service={service} isLive={isLive} path={path} height="75vh" />
      </Panel>
    </>
  );
}
