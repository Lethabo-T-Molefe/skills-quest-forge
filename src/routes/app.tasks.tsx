import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { useTasks, useUpdateTaskStatus } from "@/lib/queries/workspace";

export const Route = createFileRoute("/app/tasks")({ component: Page });

const COLS = ["To Do", "In Progress", "Done"];

function Page() {
  const { data: tasks = [], isLoading } = useTasks();
  const updateStatus = useUpdateTaskStatus();

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Student Developer · Sprint 12" />
      <div className="grid md:grid-cols-3 gap-4">
        {COLS.map(c => (
          <Panel key={c} title={c} subtitle={isLoading ? "Loading…" : undefined}>
            <div className="flex flex-col gap-3">
              {tasks.filter(t => t.status === c).map(t => (
                <div key={t.id} className="rounded-md border border-border p-3 bg-muted/30">
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{t.sprint}</div>
                  <div className="flex items-center justify-between mt-2 text-[11px] gap-2">
                    <span className="text-muted-foreground">Due {t.due}</span>
                    <Badge tone="info">{t.assignee}</Badge>
                  </div>
                  <select
                    className="mt-2 w-full bg-muted border border-border rounded-md h-7 px-2 text-[11px]"
                    value={t.status}
                    onChange={e => updateStatus.mutate({ id: t.id, status: e.target.value })}
                    disabled={updateStatus.isPending}
                  >
                    {COLS.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              ))}
              {tasks.filter(t => t.status === c).length === 0 && <div className="text-xs text-muted-foreground italic">No tasks</div>}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
