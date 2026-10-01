import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, Plus } from "lucide-react";
import { Chip, Drawer, EmptyState, QuietButton, signalButtonClass } from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import { NewDashboardForm, useDashboards } from "@/features/dashboards";
import { SupersetDashboards } from "@/features/integrations";
import { MainLayout } from "@/layouts/MainLayout";

export function DashboardsPage() {
  const dashboards = useDashboards();
  const user = useCurrentUser();
  const [creating, setCreating] = useState(false);
  const mayCreate = hasPermission(user, "manage_dashboards");

  return (
    <MainLayout
      title="Dashboards"
      description="Saved charts and metrics, kept private, shared with chosen people, or shared with everyone. Viewers only ever see data they are allowed to see."
      actions={
        <>
          {mayCreate ? (
            <QuietButton onClick={() => setCreating(true)}>
              <Plus className="size-4" strokeWidth={1.75} aria-hidden />
              New dashboard
            </QuietButton>
          ) : null}
          <Link to="/analyse" className={signalButtonClass}>
            <BarChart3 className="size-4" strokeWidth={1.75} aria-hidden />
            Make a new chart
          </Link>
        </>
      }
    >
      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          body={
            mayCreate
              ? "Build a chart in Analyse and save it to start a dashboard."
              : "Dashboards that are shared with you will appear here."
          }
          action={
            <Link to="/analyse" className={signalButtonClass}>
              Start an analysis
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
          {dashboards.map((board) => (
            <Link
              key={board.id}
              to="/dashboards/$dashboardId"
              params={{ dashboardId: board.id }}
              className="flex flex-col bg-surface-raised p-5 transition-colors hover:bg-surface-alt"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl">{board.name}</h2>
                <Chip>{board.visibility}</Chip>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {board.description || "No description."}
              </p>
              <p className="num mt-auto pt-4 text-xs text-muted-foreground">
                {board.charts} {board.charts === 1 ? "chart" : "charts"} · owner {board.owner} ·
                updated {board.updated.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        A dashboard keeps how each chart is made, not a copy of its numbers, so every viewer sees it
        computed under their own role.
      </p>

      <div className="mt-10">
        <SupersetDashboards />
      </div>

      <Drawer open={creating} title="New dashboard" onClose={() => setCreating(false)}>
        <NewDashboardForm />
      </Drawer>
    </MainLayout>
  );
}
