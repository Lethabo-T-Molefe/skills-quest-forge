import { Link, notFound, useParams } from "@tanstack/react-router";
import { BarChart3, Sparkles, Wand2 } from "lucide-react";
import { QuietButton, SignalButton } from "@/components";
import {
  DatasetInsightsPanel,
  DatasetLineagePanel,
  DatasetQualityPanel,
  DatasetTags,
  useDataset,
} from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";

export function DatasetDetailPage() {
  const { datasetId } = useParams({ from: "/datasets/$datasetId" });
  const dataset = useDataset(datasetId);
  if (!dataset) throw notFound();

  return (
    <MainLayout
      label={dataset.source === "upload" ? "uploaded file" : "governed connector"}
      title={dataset.name}
      intro={dataset.description}
      actions={
        <>
          <Link to="/datasets/$datasetId/clean" params={{ datasetId: dataset.id }}>
            <SignalButton>
              <Wand2 className="size-4" strokeWidth={1.75} />
              Clean this data
            </SignalButton>
          </Link>
          <Link to="/explorer">
            <QuietButton>
              <BarChart3 className="size-4" strokeWidth={1.5} />
              Explore
            </QuietButton>
          </Link>
          <Link to="/assistant">
            <QuietButton>
              <Sparkles className="size-4" strokeWidth={1.5} />
              Ask about it
            </QuietButton>
          </Link>
        </>
      }
    >
      <DatasetTags dataset={dataset} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <DatasetQualityPanel dataset={dataset} />

        <div className="flex flex-col gap-6">
          <DatasetInsightsPanel dataset={dataset} />
          <DatasetLineagePanel dataset={dataset} />
        </div>
      </div>
    </MainLayout>
  );
}
