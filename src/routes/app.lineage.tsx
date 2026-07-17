import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { ArrowRight } from "lucide-react";
import { useLineageGraph } from "@/lib/queries/lineage";
import type { LineageNode } from "@/lib/api/lineage";

export const Route = createFileRoute("/app/lineage")({ component: Page });

function Stage({ tone, title, items }: { tone: "info"|"warn"|"success"; title: string; items: string[] }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-muted/30 p-4">
      <Badge tone={tone}>{title}</Badge>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map(i => <li key={i} className="font-mono text-xs px-2 py-1.5 rounded bg-background border border-border">{i}</li>)}
      </ul>
    </div>
  );
}

function zoneLabels(nodes: LineageNode[], zone: string): string[] {
  return nodes.filter((n) => n.zone === zone).map((n) => n.label);
}

function PipelinePanel({ title, pipeline }: { title: string; pipeline: string }) {
  const { data, isLoading } = useLineageGraph(pipeline);
  const nodes = data?.nodes ?? [];

  return (
    <Panel title={title} subtitle={isLoading ? "Loading…" : undefined}>
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        <Stage tone="info" title="Raw" items={zoneLabels(nodes, "raw")} />
        <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
        <Stage tone="warn" title="Cleaned" items={zoneLabels(nodes, "cleaned")} />
        <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
        <Stage tone="success" title="Analytics Mart" items={zoneLabels(nodes, "mart")} />
      </div>
    </Panel>
  );
}

function Page() {
  return (
    <>
      <PageHeader title="Data Lineage" subtitle="Raw → Cleaned → Analytics flow across CHIETA pipelines" />
      <PipelinePanel title="Grants pipeline" pipeline="Grants" />
      <PipelinePanel title="Learner pipeline" pipeline="Learner" />
    </>
  );
}
