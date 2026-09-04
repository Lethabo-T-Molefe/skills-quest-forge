import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { ServiceEmbed } from "@/components/lab/service-embed";
import { UploadPanel } from "@/components/lab/upload-panel";
import { usePlaygroundLinks } from "@/lib/use-playground-links";

export const Route = createFileRoute("/app/ml-experiments")({ component: Page });

function Page() {
  const { links, isLive } = usePlaygroundLinks();

  return (
    <>
      <PageHeader title="ML Experiments" subtitle="MLflow tracking server & model registry" />

      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload a training dataset — available immediately as bronze.<table>"
      />

      <Panel
        title="MLflow"
        subtitle="Track runs, compare metrics, and promote models through the registry (Staging → Production). Log directly from a JupyterLab notebook with the mlflow Python package pointed at this tracking URI."
      >
        <ServiceEmbed service={links.mlflow} isLive={isLive} height="75vh" />
      </Panel>
    </>
  );
}
