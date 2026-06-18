import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { tasks } from "@/lib/mock-data";
export const Route = createFileRoute("/app/tasks")({ component: Page });
function Page() {
  const cols = ["To Do","In Progress","Done"];
  return (<><PageHeader title="My Tasks" subtitle="Student Developer · Sprint 12" />
    <div className="grid md:grid-cols-3 gap-4">
      {cols.map(c=>(
        <Panel key={c} title={c}>
          <div className="flex flex-col gap-3">
            {tasks.filter(t=>t.status===c).map(t=>(
              <div key={t.title} className="rounded-md border border-border p-3 bg-muted/30">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{t.sprint}</div>
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-muted-foreground">Due {t.due}</span>
                  <Badge tone="info">{t.by}</Badge>
                </div>
              </div>
            ))}
            {tasks.filter(t=>t.status===c).length===0 && <div className="text-xs text-muted-foreground italic">No tasks</div>}
          </div>
        </Panel>
      ))}
    </div></>);
}
