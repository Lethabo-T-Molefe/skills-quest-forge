import { Loader2 } from "lucide-react";
import { Panel, Badge } from "./panel";
import { VBar, Donut } from "./charts";
import { DataTable } from "./data-table";
import { useBiDashboards, useBiChartData } from "@/lib/queries/bi";
import type { BiChart, BiChartData } from "@/lib/api/bi";

// Real Superset query results, rendered with the system's own chart
// components — Superset's own web UI is never shown here.
function ChartBody({ chart, data }: { chart: BiChart; data: BiChartData }) {
  const [x, ...metricCols] = data.columns;
  if (!x || metricCols.length === 0) return <DataTable columns={data.columns} rows={data.rows} />;

  if (chart.viz_type.includes("pie") || chart.viz_type.includes("donut")) {
    const donutData = data.rows.map((row) => ({
      name: String(row[0]),
      value: Number(row[1]) || 0,
    }));
    return <Donut data={donutData} />;
  }

  if (chart.viz_type.includes("bar") || chart.viz_type.includes("line") || chart.viz_type.includes("area")) {
    const barData = data.rows.map((row) => {
      const point: Record<string, string | number> = { [x]: String(row[0]) };
      metricCols.forEach((col, i) => { point[col] = Number(row[i + 1]) || 0; });
      return point;
    });
    return <VBar data={barData} x={x} keys={metricCols} />;
  }

  return <DataTable columns={data.columns} rows={data.rows} />;
}

function ChartCard({ chart }: { chart: BiChart }) {
  const { data, isLoading, isError, error } = useBiChartData(chart.id);

  return (
    <Panel title={chart.name} subtitle={chart.viz_type} action={<Badge tone="muted">{chart.viz_type}</Badge>}>
      {isLoading && (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      {isError && <div className="text-sm text-danger">{(error as Error).message}</div>}
      {data && <ChartBody chart={chart} data={data} />}
    </Panel>
  );
}

export function BiDashboards() {
  const { data: dashboards = [], isLoading, isError, error } = useBiDashboards();

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-danger">{(error as Error).message}</div>;
  }

  if (dashboards.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No dashboards yet — create one against the warehouse to see it here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {dashboards.map((dashboard) => (
        <div key={dashboard.id} className="flex flex-col gap-3">
          <div className="font-display font-extrabold uppercase tracking-tight text-sm">
            {dashboard.title}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {dashboard.charts.map((chart) => <ChartCard key={chart.id} chart={chart} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
