import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/superset-dashboards")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader title="Superset Dashboards" subtitle="Ad-hoc BI on the shared warehouse — build and share your own dashboards" />

      <Panel title="Dashboards" subtitle="Distinct from the curated dashboards under Dashboards — build your own here">
        <ServiceEmbed service={links.superset} isLive={isLive} path="/dashboard/list/" height="70vh" />
      </Panel>
    </>
  );
}
