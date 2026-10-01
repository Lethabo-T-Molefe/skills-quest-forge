import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plug, Upload } from "lucide-react";
import {
  Notice,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { useAnalysisDatasets } from "@/features/analysis";
import { RecentActivityPanel } from "@/features/audit";
import { canApprove, canClean, hasPermission, useCurrentUser } from "@/features/auth";
import { useDashboards } from "@/features/dashboards";
import { RecentDatasetsPanel, useDatasets } from "@/features/datasets";
import { MetricTiles } from "@/features/metrics";
import { AlertsPanel, useAlerts } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";
import { cn } from "@/lib/utils";

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const smallPrimary = `${signalButtonClass} px-3.5 py-1.5 text-xs`;
const smallQuiet = `${quietButtonClass} px-3 py-1.5 text-xs`;

function Stage({
  step,
  title,
  status,
  highlight,
  children,
}: {
  step: number;
  title: string;
  status: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex flex-col bg-surface-raised p-4",
        highlight && "ring-1 ring-signal ring-inset",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <span className="num flex size-6 items-center justify-center rounded-full bg-surface-inverse text-xs text-background">
          {step}
        </span>
        {title}
      </p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{status}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </li>
  );
}

export function OverviewPage() {
  const user = useCurrentUser();
  const datasets = useDatasets();
  const dashboards = useDashboards();
  const analysable = useAnalysisDatasets();
  const alerts = useAlerts();

  const mayUpload = hasPermission(user, "upload");
  const mayClean = canClean(user);
  const raw = datasets.filter((item) => item.layer === "bronze" && item.status !== "rejected");
  const waiting = datasets.filter((item) => item.layer !== "bronze" && item.status === "pending");
  // The first raw file this member may clean themselves: their own, or any for a steward.
  const firstRaw = raw.find((item) => item.ownerId === user.id || canApprove(user));
  const openAlerts = alerts.filter((alert) => !alert.acknowledged).length;
  // Point at the stage that most needs attention, so the next step is obvious.
  const focus =
    datasets.length === 0 && mayUpload
      ? 1
      : firstRaw && mayClean
        ? 2
        : analysable.length > 0
          ? 3
          : mayUpload
            ? 1
            : 4;

  return (
    <MainLayout
      title={`${greeting()}, ${user.name.split(" ")[0]}.`}
      description="Work moves left to right: bring data in, clean it, analyse it, then share what you find. Here is where things stand."
    >
      {!user.verified ? (
        <Notice
          className="mb-5"
          tone="warn"
          title="Verify your email to start working with data"
          action={
            <Link
              to="/settings"
              className="text-sm text-signal-strong underline-offset-4 hover:underline"
            >
              Open Settings to send the link again
            </Link>
          }
        >
          Uploading and analysis unlock once you open the link we sent to {user.email}.
        </Notice>
      ) : null}

      <ol
        className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Your workflow"
      >
        <Stage
          step={1}
          title="Bring data in"
          status={
            datasets.length === 0
              ? "No datasets yet. Upload a file or connect a source to begin."
              : `${datasets.length} ${datasets.length === 1 ? "dataset" : "datasets"} you can see in the catalogue.`
          }
          highlight={focus === 1}
        >
          {mayUpload ? (
            <>
              <Link to="/datasets/upload" className={focus === 1 ? smallPrimary : smallQuiet}>
                <Upload className="size-3.5" strokeWidth={1.75} aria-hidden />
                Upload
              </Link>
              <Link to="/datasets/connect" className={smallQuiet}>
                <Plug className="size-3.5" strokeWidth={1.75} aria-hidden />
                Connect
              </Link>
            </>
          ) : (
            <Link to="/datasets" className={smallQuiet}>
              Browse datasets
            </Link>
          )}
        </Stage>
        <Stage
          step={2}
          title="Clean"
          status={
            raw.length > 0
              ? `${raw.length} ${raw.length === 1 ? "file needs" : "files need"} cleaning${waiting.length ? `, ${waiting.length} waiting for approval` : ""}.`
              : waiting.length > 0
                ? `${waiting.length} cleaned ${waiting.length === 1 ? "dataset is" : "datasets are"} waiting for approval.`
                : "Nothing is waiting to be cleaned."
          }
          highlight={focus === 2}
        >
          {firstRaw && mayClean ? (
            <Link
              to="/clean/$datasetId"
              params={{ datasetId: firstRaw.id }}
              className={focus === 2 ? smallPrimary : smallQuiet}
            >
              Clean {firstRaw.name}
            </Link>
          ) : null}
          <Link to="/clean" className={smallQuiet}>
            All files
          </Link>
        </Stage>
        <Stage
          step={3}
          title="Analyse"
          status={
            analysable.length > 0
              ? `${analysable.length} ${analysable.length === 1 ? "dataset is" : "datasets are"} approved and ready. Ask, build a chart or write SQL.`
              : "Nothing is approved for analysis yet. A steward approves cleaned data first."
          }
          highlight={focus === 3}
        >
          <Link to="/analyse" className={focus === 3 ? smallPrimary : smallQuiet}>
            Start an analysis
            <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
          </Link>
          <Link to="/analyse/ask" className={smallQuiet}>
            Ask a question
          </Link>
        </Stage>
        <Stage
          step={4}
          title="Share"
          status={
            dashboards.length > 0
              ? `${dashboards.length} ${dashboards.length === 1 ? "dashboard" : "dashboards"}. Save any chart to one, then share it.`
              : "No dashboards yet. Save a chart to start one."
          }
          highlight={focus === 4}
        >
          <Link to="/dashboards" className={focus === 4 ? smallPrimary : smallQuiet}>
            Open dashboards
          </Link>
        </Stage>
      </ol>

      <div className="mt-6">
        <MetricTiles />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <RecentDatasetsPanel />

        <section className="panel p-5" aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="font-display text-xl">
            Needs your attention
          </h2>
          <TabsRoot defaultValue="alerts" className="mt-3">
            <TabsList aria-label="Attention">
              <TabsTrigger value="alerts">
                Alerts{openAlerts > 0 ? ` (${openAlerts})` : ""}
              </TabsTrigger>
              {canApprove(user) ? (
                <TabsTrigger value="approvals">Approvals ({waiting.length})</TabsTrigger>
              ) : null}
              <TabsTrigger value="activity">Recent activity</TabsTrigger>
            </TabsList>
            <TabsContent value="alerts" className="mt-4">
              <AlertsPanel />
              <Link
                to="/monitors"
                className="mt-3 inline-block text-sm text-signal-strong underline-offset-4 hover:underline"
              >
                Open Monitors
              </Link>
            </TabsContent>
            {canApprove(user) ? (
              <TabsContent value="approvals" className="mt-4">
                {waiting.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing is waiting for a decision.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {waiting.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <Link
                          to="/datasets/$datasetId"
                          params={{ datasetId: item.id }}
                          className="underline-offset-4 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          cleaned · {item.owner}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/governance"
                  className="mt-3 inline-block text-sm text-signal-strong underline-offset-4 hover:underline"
                >
                  Open Approvals
                </Link>
              </TabsContent>
            ) : null}
            <TabsContent value="activity" className="mt-4">
              <RecentActivityPanel />
            </TabsContent>
          </TabsRoot>
        </section>
      </div>
    </MainLayout>
  );
}
