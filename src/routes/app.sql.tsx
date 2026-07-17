import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/sql")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader title="SQL Workspace" subtitle="Apache Superset SQL Lab · warehouse (mart / clean / raw)" />

      <Panel title="SQL Lab" subtitle="Query the shared warehouse and build charts from results">
        <ServiceEmbed service={links.superset} isLive={isLive} path="/sqllab/" height="70vh" />
      </Panel>
    </>
  );
}
