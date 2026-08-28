import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/lab/panel";
import { PowerBiAnalytics } from "@/components/lab/powerbi-embed";

export const Route = createFileRoute("/app/powerbi")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="Power BI Analytics"
        subtitle="Live report embedded via the Microsoft Power BI JavaScript SDK"
      />
      <PowerBiAnalytics />
    </>
  );
}
