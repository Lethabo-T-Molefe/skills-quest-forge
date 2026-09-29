import { useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { BackLink, Chip, CodeBlock, Drawer, MiniChart, QuietButton, quietButtonClass } from "@/components";
import { useDashboard, type DashboardChart } from "@/features/dashboards";
import { SharePanel } from "@/features/sharing";
import { MainLayout } from "@/layouts/MainLayout";

export function DashboardDetailPage() {
  const { dashboardId } = useParams({ from: "/dashboards/$dashboardId" });
  const dashboard = useDashboard(dashboardId);
  const [shareOpen, setShareOpen] = useState(false);
  const [sqlChart, setSqlChart] = useState<DashboardChart | null>(null);
  if (!dashboard) throw notFound();

  return (
    <MainLayout
      back={<BackLink to="/dashboards">All dashboards</BackLink>}
      title={dashboard.name}
      description={dashboard.description}
      actions={
        <QuietButton onClick={() => setShareOpen(true)}>
          <Share2 className="size-4" strokeWidth={1.5} aria-hidden />
          Share
        </QuietButton>
      }
    >
      <p className="num text-xs text-muted-foreground">
        <Chip>{dashboard.visibility}</Chip> <span className="ml-2">Owner {dashboard.owner} · updated {dashboard.updated}</span>
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {dashboard.charts.map((chart) => (
          <section key={chart.id} className="panel p-4" aria-labelledby={`chart-${chart.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{chart.metric}</p>
                <h2 id={`chart-${chart.id}`} className="font-display text-lg">
                  {chart.title}
                </h2>
              </div>
              <button
                type="button"
                className="shrink-0 text-xs text-signal-strong underline-offset-4 hover:underline"
                onClick={() => setSqlChart(chart)}
              >
                Show the SQL
              </button>
            </div>
            <div className="mt-3">
              <MiniChart type={chart.type} points={chart.points} className="h-48" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{chart.explanation}</p>
          </section>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Viewers only see rows and columns their own role allows, even on a shared dashboard.
      </p>

      <Drawer open={shareOpen} title={`Share ${dashboard.name}`} onClose={() => setShareOpen(false)}>
        <SharePanel resourceName={dashboard.name} defaultVisibility={dashboard.visibility} />
      </Drawer>

      <Drawer open={sqlChart !== null} title={sqlChart ? `SQL for ${sqlChart.title}` : "SQL"} onClose={() => setSqlChart(null)}>
        {sqlChart ? (
          <>
            <p className="text-sm text-muted-foreground">{sqlChart.explanation}</p>
            <div className="mt-4">
              <CodeBlock code={sqlChart.sql} />
            </div>
            <Link to="/analyse/code" search={{ sql: sqlChart.sql }} className={`${quietButtonClass} mt-4`}>
              Open as editable SQL
            </Link>
          </>
        ) : null}
      </Drawer>
    </MainLayout>
  );
}
