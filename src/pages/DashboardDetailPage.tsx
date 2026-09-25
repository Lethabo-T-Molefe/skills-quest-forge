import { useState } from "react";
import { notFound, useParams } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { Chip, CodeBlock, Drawer, HelpTip, MiniChart, Panel, QuietButton } from "@/components";
import { useDashboard } from "@/features/dashboards";
import { SharePanel } from "@/features/sharing";
import { MainLayout } from "@/layouts/MainLayout";

export function DashboardDetailPage() {
  const { dashboardId } = useParams({ from: "/dashboards/$dashboardId" });
  const dashboard = useDashboard(dashboardId);
  const [shareOpen, setShareOpen] = useState(false);
  const [openSql, setOpenSql] = useState<string | null>(null);
  if (!dashboard) throw notFound();

  return (
    <MainLayout
      label={dashboard.visibility.toLowerCase()}
      title={dashboard.name}
      intro={dashboard.description}
      actions={
        <QuietButton onClick={() => setShareOpen(true)}>
          <Share2 className="size-4" strokeWidth={1.5} />
          Share
        </QuietButton>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Chip>Owner · {dashboard.owner}</Chip>
        <Chip>{dashboard.visibility}</Chip>
        <Chip>Updated {dashboard.updated}</Chip>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {dashboard.charts.map((chart) => (
          <Panel key={chart.id}>
            <p className="label-paren">({chart.metric})</p>
            <h2 className="heading-2 mt-1">{chart.title}</h2>
            <div className="mt-4">
              <MiniChart type={chart.type} points={chart.points} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{chart.explanation}</p>
            <button
              type="button"
              className="mt-3 text-sm text-signal-strong underline-offset-4 hover:underline"
              onClick={() => setOpenSql(chart.sql)}
            >
              Show the SQL
            </button>
          </Panel>
        ))}
      </div>

      {openSql ? (
        <div className="mt-6">
          <CodeBlock code={openSql} />
        </div>
      ) : null}

      <div className="mt-6">
        <HelpTip>
          A shared dashboard never exposes private data the viewer is not allowed to see. Row-level and column-level
          security still apply.
        </HelpTip>
      </div>

      <Drawer open={shareOpen} title={`Share ${dashboard.name}`} onClose={() => setShareOpen(false)}>
        <SharePanel resourceName={dashboard.name} defaultVisibility={dashboard.visibility} />
      </Drawer>
    </MainLayout>
  );
}
