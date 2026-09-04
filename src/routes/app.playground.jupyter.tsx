import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Notebook } from "@/components/lab/notebook";
import { UploadPanel } from "@/components/lab/upload-panel";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/playground/jupyter")({ component: Page });

function Page() {
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Python Workspace"
        subtitle={`Primary IDE — ${ROLE_IDENTITY[role].name}'s workspace`}
      />

      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload CSV, TSV, JSON or Excel — query bronze.<table> from a cell below"
      />

      <Panel
        title="Python"
        subtitle="Data science, SQL prep, and experimentation — real kernel execution, styled to match the rest of the system."
      >
        <Notebook />
      </Panel>
    </>
  );
}
