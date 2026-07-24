import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/playground/mlflow")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader title="MLflow Experiments" subtitle="Tracking server & model registry" />
      <Panel
        title="MLflow"
        subtitle="Log runs from JupyterLab notebooks pointed at this tracking URI."
      >
        <ServiceEmbed service={links.mlflow} isLive={isLive} height="75vh" />
      </Panel>
    </>
  );
}
