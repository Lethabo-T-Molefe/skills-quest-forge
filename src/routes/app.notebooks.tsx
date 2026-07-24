import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Notebook } from "@/components/lab/notebook";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/notebooks")({ component: Page });

function Page() {
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Notebooks"
        subtitle={`${ROLE_IDENTITY[role].name}'s Python workspace — runs against a real kernel, no login form`}
      />

      <Panel
        title="Python"
        subtitle="Write and run Python cells against a real kernel — state persists across cells like a real notebook. Nothing here is saved yet; export/save-to-file is a follow-up."
      >
        <Notebook />
      </Panel>
    </>
  );
}
