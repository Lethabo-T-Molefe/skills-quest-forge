import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/playground/superset")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader
        title="Superset"
        subtitle="Dashboards and SQL Workspace (SQL Lab) against the shared warehouse"
      />
      <Panel title="Apache Superset" subtitle="Open SQL Lab from the top menu, or browse dashboards">
        <ServiceEmbed service={links.superset} isLive={isLive} height="75vh" />
      </Panel>
    </>
  );
}
