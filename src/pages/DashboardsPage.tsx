import { Link } from "@tanstack/react-router";
import { Chip, EmptyState, Panel } from "@/components";
import { useDashboards } from "@/features/dashboards";
import { MainLayout } from "@/layouts/MainLayout";

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
          {dashboards.map((board) => (
              <Link
                key={board.id}
                to="/dashboards/$dashboardId"
                params={{ dashboardId: board.id }}
                className="bg-surface-raised p-6 hover:bg-surface-alt"
              >
                  <p className="label-paren">({board.visibility.toLowerCase()})</p>
                  <h2 className="heading-2 mt-1">{board.name}</h2>
                  <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">{board.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip>{board.charts.length} charts</Chip>
                    <Chip>Owner · {board.owner}</Chip>
                    <Chip>{board.updated}</Chip>
                  </div>
              </Link>
          ))}
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
