import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { Chip, EmptyState, signalButtonClass } from "@/components";
import { useDashboards } from "@/features/dashboards";
import { MainLayout } from "@/layouts/MainLayout";

export function DashboardsPage() {
  const dashboards = useDashboards();

  return (
    <MainLayout
      title="Dashboards"
      description="Saved charts and metrics, kept private, shared with chosen people, or shared with everyone. Viewers only ever see data they are allowed to see."
      actions={
        <Link to="/analyse" className={signalButtonClass}>
          <BarChart3 className="size-4" strokeWidth={1.75} aria-hidden />
          Make a new chart
        </Link>
      }
    >
      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          body="Build a chart in Analyse and save it to start a dashboard."
          action={
            <Link to="/analyse" className={signalButtonClass}>
              Start an analysis
            </Link>
          }
        />
      ) : (
        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
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
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{board.description}</p>
              <p className="num mt-auto pt-4 text-xs text-muted-foreground">
                {board.charts.length} charts · owner {board.owner} · updated {board.updated}
              </p>
            </Link>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Approved dashboards can also be embedded in other internal applications. Embeds are read-only and honour the
        same permissions.
      </p>
    </MainLayout>
  );
}
