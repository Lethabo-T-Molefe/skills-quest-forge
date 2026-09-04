import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/lab/panel";
import { MlflowConsole } from "@/components/lab/mlflow-console";
import { UploadPanel } from "@/components/lab/upload-panel";

export const Route = createFileRoute("/app/playground/mlflow")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="MLflow Experiments"
        subtitle="Real experiment tracking & model registry, self-hosted — CHIETA-styled end to end"
      />
      <UploadPanel
        onUploaded={() => {}}
        subtitle="Upload a training dataset — it appears in Quick Train's dataset picker below"
      />
      <MlflowConsole />
    </>
  );
}
