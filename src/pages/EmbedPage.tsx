import { useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Logo, Notice } from "@/components";
import { DashboardChartCard, fetchEmbeddedDashboard } from "@/features/dashboards";
import { errorMessage } from "@/lib/api";

/**
 * A dashboard as another internal application shows it in a frame: read-only, organisation-wide data only,
 * and read with the signed token from its embed link rather than a member's session.
 */
export function EmbedPage() {
  const { dashboardId } = useParams({ from: "/embed/$dashboardId" });
  const { token } = useSearch({ from: "/embed/$dashboardId" });
  const dashboard = useQuery({
    queryKey: ["embed", dashboardId, token],
    queryFn: () => fetchEmbeddedDashboard(dashboardId, token),
    enabled: token.length > 0,
    retry: false,
    // An embedded dashboard stays open on a wall or an intranet page, so it keeps itself current.
    refetchInterval: 5 * 60_000,
  });

  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px]">
        {!token ? (
          <Notice tone="signal" title="This embed link is incomplete">
            Copy the whole link from the dashboard&apos;s Manage panel.
          </Notice>
        ) : dashboard.isPending ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading the dashboard…
          </p>
        ) : dashboard.isError ? (
          <Notice tone="signal" title="The dashboard cannot be shown">
            {errorMessage(dashboard.error)}
          </Notice>
        ) : (
          <>
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-2xl">{dashboard.data.name}</h1>
                {dashboard.data.description ? (
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    {dashboard.data.description}
                  </p>
                ) : null}
              </div>
              <Logo variant="submark" className="size-8 shrink-0" />
            </header>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {dashboard.data.charts.map((chart) => (
                <DashboardChartCard
                  key={chart.id}
                  chart={{ ...chart, config: null, sql: "" }}
                  canEdit={false}
                  removing={false}
                  onShowSql={() => undefined}
                  onRemove={() => undefined}
                />
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Read-only · organisation-wide data · updated {dashboard.data.updated.toLowerCase()}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
