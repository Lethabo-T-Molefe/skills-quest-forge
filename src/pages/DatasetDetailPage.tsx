import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Settings2, Share2 } from "lucide-react";
import {
  BackLink,
  Drawer,
  JourneySteps,
  Notice,
  QuietButton,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@/components";
import { canApprove, hasPermission, useCurrentUser } from "@/features/auth";
import {
  DatasetColumnsTable,
  DatasetDecision,
  DatasetInsightsList,
  DatasetLineagePanel,
  DatasetManage,
  DatasetNextAction,
  DatasetQualitySummary,
  DatasetRowsPreview,
  DatasetSharing,
  DatasetTags,
  useDataset,
} from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";

function formatDecisionDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(iso));
}

export function DatasetDetailPage() {
  const { datasetId } = useParams({ from: "/datasets/$datasetId" });
  const dataset = useDataset(datasetId);
  const user = useCurrentUser();
  const [shareOpen, setShareOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const mayManage =
    dataset.ownerId === user.id ||
    user.roleId === "admin" ||
    hasPermission(user, "manage_policies");
  const awaitingDecision = dataset.status === "pending" && canApprove(user);

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title={dataset.name}
      description={dataset.description}
      actions={
        <>
          {mayManage ? (
            <QuietButton onClick={() => setManageOpen(true)}>
              <Settings2 className="size-4" strokeWidth={1.5} aria-hidden />
              Manage
            </QuietButton>
          ) : null}
          <QuietButton onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" strokeWidth={1.5} aria-hidden />
            Share
          </QuietButton>
          <DatasetNextAction dataset={dataset} />
        </>
      }
    >
      <div className="panel grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <JourneySteps steps={dataset.journey} />
        <p className="text-sm text-muted-foreground md:max-w-xs md:text-right">
          {dataset.nextStep.reason}
        </p>
      </div>

      {awaitingDecision ? (
        <Notice
          className="mt-4"
          tone="warn"
          title={
            dataset.layer === "bronze" ? "Still raw, and waiting" : "Waiting for your decision"
          }
          action={<DatasetDecision dataset={dataset} />}
        >
          {dataset.layer === "bronze"
            ? "Raw data is never analysed, so it is cleaned before it can be approved. You can reject it now if it should not be used at all."
            : "Review the quality, columns and rows below. Approval makes it available for analysis."}
        </Notice>
      ) : null}

      {dataset.status === "rejected" ? (
        <Notice
          className="mt-4"
          tone="signal"
          title={`Rejected${dataset.decision?.at ? ` on ${formatDecisionDate(dataset.decision.at)}` : ""}`}
          action={
            canApprove(user) && dataset.layer !== "bronze" ? (
              <DatasetDecision dataset={dataset} />
            ) : undefined
          }
        >
          {dataset.decision?.reason ?? "No reason was recorded."} Clean it again to send it back for
          approval.
        </Notice>
      ) : null}

      {dataset.status === "approved" && dataset.decision?.reason ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Approved{dataset.decision.at ? ` on ${formatDecisionDate(dataset.decision.at)}` : ""}:{" "}
          {dataset.decision.reason}
        </p>
      ) : null}

      <TabsRoot defaultValue="overview" className="mt-5">
        <TabsList aria-label="Dataset details">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="columns">Columns ({dataset.columns.length})</TabsTrigger>
          <TabsTrigger value="rows">Rows</TabsTrigger>
          <TabsTrigger value="lineage">Where it came from</TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
        >
          <div className="space-y-6">
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
              <p className="mt-3 text-xs text-muted-foreground">
                Source: {dataset.sourceName} · updated {dataset.updated}
                {dataset.table ? ` · read as ${dataset.table}` : ""}
              </p>
            </section>
          </div>
          <section className="panel p-5" aria-labelledby="insights-heading">
            <h2 id="insights-heading" className="font-display text-xl">
              What we noticed
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              Found automatically when the data arrived, with a suggested next step.
            </p>
            <DatasetInsightsList dataset={dataset} />
          </section>
        </TabsContent>

        <TabsContent value="columns" className="mt-4">
          <DatasetColumnsTable dataset={dataset} />
        </TabsContent>

        <TabsContent value="rows" className="mt-4">
          <DatasetRowsPreview dataset={dataset} />
        </TabsContent>

        <TabsContent value="lineage" className="mt-4 max-w-3xl">
          <DatasetLineagePanel dataset={dataset} />
          {dataset.layer !== "bronze" ? (
            <p className="mt-4 text-sm">
              <Link
                to="/clean/$datasetId"
                params={{ datasetId: dataset.id }}
                className="text-signal-strong underline-offset-4 hover:underline"
              >
                Open the cleaning recipe
              </Link>{" "}
              to see or rerun the steps that produced the cleaned table.
            </p>
          ) : null}
        </TabsContent>
      </TabsRoot>

      <Drawer open={shareOpen} title={`Share ${dataset.name}`} onClose={() => setShareOpen(false)}>
        <DatasetSharing dataset={dataset} />
      </Drawer>

      <Drawer
        open={manageOpen}
        title={`Manage ${dataset.name}`}
        onClose={() => setManageOpen(false)}
      >
        <DatasetManage dataset={dataset} onDone={() => setManageOpen(false)} />
      </Drawer>
    </MainLayout>
  );
}
