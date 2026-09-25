import { useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { BarChart3, Share2, Sparkles, Wand2 } from "lucide-react";
import { Drawer, QuietButton, quietButtonClass, signalButtonClass } from "@/components";
import { canApprove, canClean, useCurrentUser } from "@/features/auth";
import {
  DatasetInsightsPanel,
  DatasetLineagePanel,
  DatasetQualityPanel,
  DatasetTags,
  useDataset,
} from "@/features/datasets";
import { SharePanel } from "@/features/sharing";
import { MainLayout } from "@/layouts/MainLayout";

export function DatasetDetailPage() {
  const { datasetId } = useParams({ from: "/datasets/$datasetId" });
  const dataset = useDataset(datasetId);
  const user = useCurrentUser();
  const [shareOpen, setShareOpen] = useState(false);
  if (!dataset) throw notFound();

  return (
    <MainLayout
      label={dataset.source === "upload" ? "uploaded file" : "governed connector"}
      title={dataset.name}
      intro={dataset.description}
      actions={
        <>
          {canClean(user) ? (
            <Link to="/datasets/$datasetId/clean" params={{ datasetId: dataset.id }} className={signalButtonClass}>
              <Wand2 className="size-4" strokeWidth={1.75} />
              Clean this data
            </Link>
          ) : null}
          <Link to="/explorer" search={{ dataset: dataset.id }} className={quietButtonClass}>
            <BarChart3 className="size-4" strokeWidth={1.5} />
            Explore
          </Link>
          <Link to="/assistant" className={quietButtonClass}>
            <Sparkles className="size-4" strokeWidth={1.5} />
            Ask about it
          </Link>
          <QuietButton onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" strokeWidth={1.5} />
            Share
          </QuietButton>
        </>
      }
    >
      <DatasetTags dataset={dataset} />

      {dataset.status === "pending" && canApprove(user) ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <QuietButton
            onClick={() => toast.success("Dataset approved. It is now queryable in silver and gold according to its layer.")}
          >
            Approve for use
          </QuietButton>
          <QuietButton onClick={() => toast.error("Dataset rejected. The reason is stored with the decision.")}>
            Reject
          </QuietButton>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <DatasetQualityPanel dataset={dataset} />

        <div className="flex flex-col gap-6">
          <DatasetInsightsPanel dataset={dataset} />
          <DatasetLineagePanel dataset={dataset} />
        </div>
      </div>

      <Drawer open={shareOpen} title={`Share ${dataset.name}`} onClose={() => setShareOpen(false)}>
        <SharePanel resourceName={dataset.name} />
      </Drawer>
    </MainLayout>
  );
}
