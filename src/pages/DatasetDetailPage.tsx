import { useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import {
  BackLink,
  Drawer,
  JourneySteps,
  Notice,
  QuietButton,
  SignalButton,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@/components";
import { canApprove, useCurrentUser } from "@/features/auth";
import {
  DatasetColumnsTable,
  DatasetInsightsList,
  DatasetLineagePanel,
  DatasetNextAction,
  DatasetQualitySummary,
  DatasetTags,
  journeyFor,
  nextStepFor,
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
  const step = nextStepFor(dataset, user);

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title={dataset.name}
      description={dataset.description}
      actions={
        <>
          <QuietButton onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" strokeWidth={1.5} aria-hidden />
            Share
          </QuietButton>
          <DatasetNextAction dataset={dataset} />
        </>
      }
    >
      <div className="panel grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <JourneySteps steps={journeyFor(dataset)} />
        <p className="text-sm text-muted-foreground md:max-w-xs md:text-right">{step.reason}</p>
      </div>

      {dataset.status === "pending" && canApprove(user) ? (
        <Notice
          className="mt-4"
          tone="warn"
          title="Waiting for your decision"
          action={
            <div className="flex flex-wrap gap-2">
              <SignalButton
                onClick={() => toast.success("Dataset approved", { description: "It is now available in Analyse." })}
              >
                Approve for use
              </SignalButton>
              <QuietButton onClick={() => toast.error("Dataset rejected", { description: "The reason is stored with the decision." })}>
                Reject
              </QuietButton>
            </div>
          }
        >
          {dataset.layer === "bronze"
            ? "This is still the raw file. You can decide now, or wait for the cleaned copy. Review the quality and columns below."
            : "Review the quality and columns below. Approval makes it available for analysis."}
        </Notice>
      ) : null}

      <TabsRoot defaultValue="overview" className="mt-5">
        <TabsList aria-label="Dataset details">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="columns">Columns ({dataset.columns.length})</TabsTrigger>
          <TabsTrigger value="lineage">Where it came from</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-5">
            <section aria-labelledby="quality-heading">
              <h2 id="quality-heading" className="font-sans mb-2 text-sm font-medium">
                Quality when it arrived
              </h2>
              <DatasetQualitySummary dataset={dataset} />
            </section>
            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="font-sans mb-2 text-sm font-medium">
                About this dataset
              </h2>
              <DatasetTags dataset={dataset} />
            </section>
          </div>
          <section className="panel p-5" aria-labelledby="insights-heading">
            <h2 id="insights-heading" className="font-display text-xl">
              What we noticed
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">Found automatically when the data arrived, with a suggested next step.</p>
            <DatasetInsightsList dataset={dataset} />
          </section>
        </TabsContent>

        <TabsContent value="columns" className="mt-4">
          <DatasetColumnsTable dataset={dataset} />
        </TabsContent>

        <TabsContent value="lineage" className="mt-4 max-w-3xl">
          <DatasetLineagePanel dataset={dataset} />
          {dataset.layer !== "bronze" ? (
            <p className="mt-4 text-sm">
              <Link to="/clean/$datasetId" params={{ datasetId: dataset.id }} className="text-signal-strong underline-offset-4 hover:underline">
                Open the cleaning recipe
              </Link>{" "}
              to see or rerun the steps that produced the silver table.
            </p>
          ) : null}
        </TabsContent>
      </TabsRoot>

      <Drawer open={shareOpen} title={`Share ${dataset.name}`} onClose={() => setShareOpen(false)}>
        <SharePanel resourceName={dataset.name} />
      </Drawer>
    </MainLayout>
  );
}
