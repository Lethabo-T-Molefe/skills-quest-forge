import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plug, Upload } from "lucide-react";
import { TabsContent, TabsList, TabsRoot, TabsTrigger, quietButtonClass, signalButtonClass } from "@/components";
import { canApprove, useCurrentUser } from "@/features/auth";
import { RecentActivityPanel } from "@/features/audit";
import { useDashboards } from "@/features/dashboards";
import { RecentDatasetsPanel, useDatasets } from "@/features/datasets";
import { MetricTiles } from "@/features/metrics";
import { AlertsPanel } from "@/features/monitors";
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
    <li className={cn("flex flex-col bg-surface-raised p-4", highlight && "ring-1 ring-signal ring-inset")}>
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

  const raw = datasets.filter((item) => item.layer === "bronze");
  const ready = datasets.filter((item) => item.status === "approved");
  const waiting = datasets.filter((item) => item.layer !== "bronze" && item.status === "pending");
  const pendingAll = datasets.filter((item) => item.status === "pending");
  const firstRaw = raw[0];
  // Point at the stage that most needs attention, so the next step is obvious.
  const focus = raw.length > 0 ? 2 : ready.length > 0 ? 3 : 1;

  return (
    <MainLayout
      title={`${greeting()}, ${user.name.split(" ")[0]}.`}
      description="Work moves left to right: bring data in, clean it, analyse it, then share what you find. Here is where things stand."
    >
      <ol className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4" aria-label="Your workflow">
        <Stage step={1} title="Bring data in" status={`${datasets.length} datasets in the catalogue.`} highlight={focus === 1}>
          <Link to="/datasets/upload" className={focus === 1 ? smallPrimary : smallQuiet}>
            <Upload className="size-3.5" strokeWidth={1.75} aria-hidden />
            Upload
          </Link>
          <Link to="/datasets/connect" className={smallQuiet}>
            <Plug className="size-3.5" strokeWidth={1.75} aria-hidden />
            Connect
          </Link>
        </Stage>
        <Stage
          step={2}
          title="Clean"
          status={
            raw.length > 0
              ? `${raw.length} ${raw.length === 1 ? "file needs" : "files need"} cleaning${waiting.length ? `, ${waiting.length} waiting for approval` : ""}.`
              : "Nothing is waiting to be cleaned."
          }
          highlight={focus === 2}
        >
          {firstRaw ? (
            <Link to="/clean/$datasetId" params={{ datasetId: firstRaw.id }} className={focus === 2 ? smallPrimary : smallQuiet}>
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
          status={`${ready.length} ${ready.length === 1 ? "dataset is" : "datasets are"} approved and ready. Ask, build a chart or write SQL.`}
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
        <Stage step={4} title="Share" status={`${dashboards.length} dashboards. Save any chart to one, then share it.`}>
          <Link to="/dashboards" className={smallQuiet}>
            Open dashboards
          </Link>
        </Stage>
      </ol>

      <div className="mt-5">
        <MetricTiles />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <RecentDatasetsPanel />

        <section className="panel p-5" aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="font-display text-xl">
            Needs your attention
          </h2>
          <TabsRoot defaultValue="alerts" className="mt-3">
            <TabsList aria-label="Attention">
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              {canApprove(user) ? <TabsTrigger value="approvals">Approvals ({pendingAll.length})</TabsTrigger> : null}
              <TabsTrigger value="activity">Recent activity</TabsTrigger>
            </TabsList>
            <TabsContent value="alerts" className="mt-3">
              <AlertsPanel />
            </TabsContent>
            {canApprove(user) ? (
              <TabsContent value="approvals" className="mt-3">
                {pendingAll.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing is waiting for a decision.</p>
                ) : (
                  <ul className="space-y-2">
                    {pendingAll.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <Link to="/datasets/$datasetId" params={{ datasetId: item.id }} className="underline-offset-4 hover:underline">
                          {item.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{item.layer === "bronze" ? "raw" : "cleaned"}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/governance" className="mt-3 inline-block text-sm text-signal-strong underline-offset-4 hover:underline">
                  Open Approvals
                </Link>
              </TabsContent>
            ) : null}
            <TabsContent value="activity" className="mt-3">
              <RecentActivityPanel />
            </TabsContent>
          </TabsRoot>
        </section>
      </div>
    </MainLayout>
  );
}
