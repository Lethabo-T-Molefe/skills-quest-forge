import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/lab/panel";
import { MlflowConsole } from "@/components/lab/mlflow-console";

export const Route = createFileRoute("/app/playground/mlflow")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="MLflow Experiments"
        subtitle="Real experiment tracking & model registry, self-hosted — CHIETA-styled end to end"
      />
      <MlflowConsole />
    </>
  );
}
