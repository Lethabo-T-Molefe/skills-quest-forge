import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/lab/panel";
import { BiDashboards } from "@/components/lab/bi-dashboard";
import { UploadPanel } from "@/components/lab/upload-panel";

export const Route = createFileRoute("/app/playground/superset")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="Superset"
        subtitle="Dashboards against the shared warehouse — for open-ended SQL, use the SQL Workspace"
      />
      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload CSV, TSV, JSON or Excel — build a Superset dashboard against it"
      />
      <BiDashboards />
    </>
  );
}
