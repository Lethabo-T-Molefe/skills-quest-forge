import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/lab/panel";
import { BiDashboards } from "@/components/lab/bi-dashboard";
import { UploadPanel } from "@/components/lab/upload-panel";

export const Route = createFileRoute("/app/superset-dashboards")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="Superset Dashboards"
        subtitle="Ad-hoc BI on the shared warehouse — distinct from the curated dashboards under Dashboards"
      />
      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload CSV, TSV, JSON or Excel — build a Superset dashboard against it"
      />
      <BiDashboards />
    </>
  );
}
