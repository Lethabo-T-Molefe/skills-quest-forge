import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
export const Route = createFileRoute("/app/settings")({ component: Page });
function Page() {
  return (<><PageHeader title="Settings" subtitle="Workspace, security & integration preferences" />
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel title="Workspace">
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Organisation</span><input defaultValue="CHIETA" className="bg-muted border border-border rounded-md h-9 px-3 text-sm" /></label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Timezone</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Africa/Johannesburg (SAST)</option></select></label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Date format</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>14 Jun 2026</option><option>2026-06-14</option></select></label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Currency</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>ZAR (R)</option></select></label>
        </div>
      </Panel>
      <Panel title="Security">
        <div className="grid gap-3 text-sm">
          <label className="flex items-center justify-between"><span>Multi-factor authentication required</span><input type="checkbox" defaultChecked className="accent-accent"/></label>
          <label className="flex items-center justify-between"><span>Session timeout (30 min idle)</span><input type="checkbox" defaultChecked className="accent-accent"/></label>
          <label className="flex items-center justify-between"><span>IP allow-list (CHIETA network)</span><input type="checkbox" defaultChecked className="accent-accent"/></label>
          <label className="flex items-center justify-between"><span>POPIA notice on every login</span><input type="checkbox" defaultChecked className="accent-accent"/></label>
        </div>
      </Panel>
    </div></>);
}
