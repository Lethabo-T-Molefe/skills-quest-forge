import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Award } from "lucide-react";
import { useContributions } from "@/lib/queries/workspace";

export const Route = createFileRoute("/app/contributions")({ component: Page });

function Page() {
  const { data: contributions = [], isLoading } = useContributions("R. Mahlangu");

  // Derived from the fetched contributions list (trivial client-side sums);
  // "Badges earned" has no backing data model yet, so it stays page-local/static.
  const tasksCompleted = contributions.filter(c => c.status === "Merged").length;
  const hoursLogged = contributions.reduce((sum, c) => sum + c.hours, 0);

  const stats = [
    ["Tasks completed", String(tasksCompleted)],
    ["Hours logged", String(hoursLogged)],
    ["Badges earned", "3"],
  ];

  return (
    <>
      <PageHeader title="My Contributions" subtitle="R. Mahlangu · Student Developer · CPUT" />
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map(([l, v]) => (
          <div key={l} className="sw-card bg-card p-4">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="font-display text-3xl font-bold mt-1">{isLoading ? "…" : v}</div>
          </div>
        ))}
      </div>
      <Panel title="Badges">
        <div className="flex gap-4">
          {[
            { n: "Bronze", c: "oklch(0.6 0.1 50)" },
            { n: "Silver", c: "oklch(0.78 0.02 240)" },
            { n: "Gold", c: "oklch(0.82 0.16 80)" },
            { n: "Platinum", c: "oklch(0.85 0.05 200)", muted: true },
          ].map(b => (
            <div key={b.n} className="text-center">
              <div className={`size-16 rounded-full grid place-items-center border-2 border-border ${b.muted ? "opacity-30" : ""}`} style={{ background: b.c }}>
                <Award className="size-7 text-background" />
              </div>
              <div className="text-xs mt-2 font-medium">{b.n}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Activity log" subtitle={isLoading ? "Loading…" : `${contributions.length} entries`}>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Sprint</th><th className="text-left">Task</th><th className="text-right">Hours</th><th>PR</th><th>Reviewed by</th><th>Status</th></tr></thead>
          <tbody>
            {contributions.map(c => (
              <tr key={c.id} className="border-t border-border">
                <td className="py-2">{c.sprint}</td>
                <td>{c.task}</td>
                <td className="text-right">{c.hours}</td>
                <td className="font-mono text-xs">{c.pr_number}</td>
                <td>{c.reviewed_by}</td>
                <td><Badge tone={c.status === "Merged" ? "success" : c.status === "Rejected" ? "danger" : "warn"}>{c.status}</Badge></td>
              </tr>
            ))}
            {contributions.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="py-6 text-center text-muted-foreground italic">No contributions logged yet</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
