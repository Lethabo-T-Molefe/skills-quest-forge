import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart3, Settings2, Share2 } from "lucide-react";
import {
  BackLink,
  Chip,
  CodeBlock,
  Drawer,
  EmptyState,
  QuietButton,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { canRunSql, useCurrentUser } from "@/features/auth";
import {
  DashboardChartCard,
  DashboardManage,
  DashboardSharing,
  removeChart,
  useDashboard,
  type DashboardChart,
} from "@/features/dashboards";
import { MainLayout } from "@/layouts/MainLayout";
import { notifyError } from "@/lib/notify";

export function DashboardDetailPage() {
  const { dashboardId } = useParams({ from: "/dashboards/$dashboardId" });
  const dashboard = useDashboard(dashboardId);
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [sqlChart, setSqlChart] = useState<DashboardChart | null>(null);

  const remove = useMutation({
    mutationFn: (chart: DashboardChart) => removeChart(dashboard.id, chart.id),
    onSuccess: async (_result, chart) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      toast.success(`${chart.title} removed`);
    },
    onError: notifyError("The chart could not be removed."),
  });

  return (
    <MainLayout
      back={<BackLink to="/dashboards">All dashboards</BackLink>}
      title={dashboard.name}
      description={dashboard.description}
      actions={
        <>
          {dashboard.canEdit ? (
            <QuietButton onClick={() => setManageOpen(true)}>
              <Settings2 className="size-4" strokeWidth={1.5} aria-hidden />
              Manage
            </QuietButton>
          ) : null}
          <QuietButton onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" strokeWidth={1.5} aria-hidden />
            Share
          </QuietButton>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Chip>{dashboard.visibility}</Chip>
        {dashboard.embedEnabled ? <Chip tone="ok">Embedding on</Chip> : null}
        <span className="num">
          Owner {dashboard.owner} · updated {dashboard.updated.toLowerCase()}
          {dashboard.sharedWith.length > 0
            ? ` · shared with ${dashboard.sharedWith.join(", ")}`
            : ""}
        </span>
      </div>

      {dashboard.charts.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="This dashboard has no charts yet"
            body="Build a chart in Analyse, or ask a question, then choose Save to a dashboard."
            action={
              <Link to="/analyse" className={signalButtonClass}>
                <BarChart3 className="size-4" strokeWidth={1.75} aria-hidden />
                Make a chart
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {dashboard.charts.map((chart) => (
            <DashboardChartCard
              key={chart.id}
              chart={chart}
              canEdit={dashboard.canEdit}
              removing={remove.isPending && remove.variables?.id === chart.id}
              onShowSql={() => setSqlChart(chart)}
              onRemove={() => remove.mutate(chart)}
            />
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">
        These figures were computed for you just now. Another viewer sees only the rows and columns
        their own role allows, even on a shared dashboard.
      </p>

      <Drawer
        open={shareOpen}
        title={`Share ${dashboard.name}`}
        onClose={() => setShareOpen(false)}
      >
        <DashboardSharing dashboard={dashboard} />
      </Drawer>

      <Drawer
        open={manageOpen}
        title={`Manage ${dashboard.name}`}
        onClose={() => setManageOpen(false)}
      >
        <DashboardManage dashboard={dashboard} onDone={() => setManageOpen(false)} />
      </Drawer>

      <Drawer
        open={sqlChart !== null}
        title={sqlChart ? `SQL for ${sqlChart.title}` : "SQL"}
        onClose={() => setSqlChart(null)}
      >
        {sqlChart ? (
          <>
            <p className="text-sm text-muted-foreground">{sqlChart.explanation}</p>
            <div className="mt-4">
              <CodeBlock code={sqlChart.sql} />
            </div>
            {canRunSql(user) ? (
              <Link
                to="/analyse/code"
                search={{ sql: sqlChart.sql }}
                className={`${quietButtonClass} mt-4`}
              >
                Open as editable SQL
              </Link>
            ) : null}
          </>
        ) : null}
      </Drawer>
    </MainLayout>
  );
}
