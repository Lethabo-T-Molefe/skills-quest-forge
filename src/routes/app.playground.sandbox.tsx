import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Notebook } from "@/components/lab/notebook";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/playground/sandbox")({ component: Page });

function Page() {
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Student Sandbox"
        subtitle={`Controlled Python workspace — ${ROLE_IDENTITY[role].name}`}
        actions={<Badge tone="info">Sandbox</Badge>}
      />
      <Panel
        title="Student co-development space"
        subtitle="Same real-kernel execution as the primary Python workspace, scoped for student contributors."
      >
        <Notebook />
      </Panel>
    </>
  );
}
