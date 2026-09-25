import { Link } from "@tanstack/react-router";
import { Chip, EmptyState, MediaFrame, Panel } from "@/components";
import { media } from "@/config/media";
import { useDashboards } from "@/features/dashboards";
import { MainLayout } from "@/layouts/MainLayout";

const dashboardCovers = [media.plot, media.cleaned, media.hero, media.hands] as const;

export function DashboardsPage() {
  const dashboards = useDashboards();

  return (
    <MainLayout
      label="saved charts and metrics"
      title="Dashboards"
      intro="A dashboard can be private, shared with selected members, or shared across the organisation. A shared dashboard renders read-only and never exposes private data the viewer is not allowed to see."
    >
      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          body="Save a chart from the explorer to start a board."
        />
      ) : (
        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {dashboards.map((board, index) => {
            const cover = dashboardCovers[index % dashboardCovers.length] ?? media.plates;
            return (
              <Link
                key={board.id}
                to="/dashboards/$dashboardId"
                params={{ dashboardId: board.id }}
                className="group bg-surface-raised hover:bg-surface-alt"
              >
                <MediaFrame {...cover} ratio="16 / 9" />
                <div className="p-6">
                  <p className="label-paren">({board.visibility.toLowerCase()})</p>
                  <h2 className="heading-2 mt-1">{board.name}</h2>
                  <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">{board.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip>{board.charts.length} charts</Chip>
                    <Chip>Owner · {board.owner}</Chip>
                    <Chip>{board.updated}</Chip>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Panel className="mt-6">
        <h2 className="heading-2">Embedding</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          Approved dashboards can be embedded in another internal application. The embed is read-only and honours the
          same permissions as this workspace.
        </p>
      </Panel>
    </MainLayout>
  );
}
