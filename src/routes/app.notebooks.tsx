import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Notebook } from "@/components/lab/notebook";
import { UploadPanel } from "@/components/lab/upload-panel";
import { useRole } from "@/lib/role-context";
import { ROLE_IDENTITY } from "@/lib/roles";

export const Route = createFileRoute("/app/notebooks")({ component: Page });

function Page() {
  const { role } = useRole();

  return (
    <>
      <PageHeader
        title="Notebooks"
        subtitle={`${ROLE_IDENTITY[role].name}'s workspace — runs against a real kernel, no login form`}
      />

      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload CSV, TSV, JSON or Excel — query bronze.<table> from a cell below"
      />

      <Panel
        title="Notebook"
        subtitle="Write and run Python or R cells against a real kernel — state persists across cells like a real notebook. Save, open, and download as .ipynb."
      >
        <Notebook />
      </Panel>
    </>
  );
}
