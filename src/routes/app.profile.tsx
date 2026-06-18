import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
export const Route = createFileRoute("/app/profile")({ component: Page });
function Page() {
  return (<><PageHeader title="My Profile" />
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <Panel title="Identity">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="size-24 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-3xl font-bold">TM</div>
          <div className="text-center">
            <div className="font-display text-lg font-bold">T. Mokoena</div>
            <div className="text-xs text-muted-foreground">t.mokoena@chieta.org.za</div>
            <Badge tone="accent">System Admin</Badge>
          </div>
        </div>
      </Panel>
      <div className="flex flex-col gap-6">
        <Panel title="Profile">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Full name</span><input defaultValue="Thabiso Mokoena" className="bg-muted border border-border rounded-md h-9 px-3 text-sm" /></label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Department</span><input defaultValue="Strategy & Performance" className="bg-muted border border-border rounded-md h-9 px-3 text-sm" /></label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Phone</span><input defaultValue="+27 11 555 0123" className="bg-muted border border-border rounded-md h-9 px-3 text-sm" /></label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Office</span><input defaultValue="Johannesburg HQ" className="bg-muted border border-border rounded-md h-9 px-3 text-sm" /></label>
          </div>
        </Panel>
        <Panel title="Security">
          <button className="text-sm px-3 py-2 rounded-md border border-border mr-2">Change password</button>
          <button className="text-sm px-3 py-2 rounded-md border border-border mr-2">Manage MFA</button>
          <button className="text-sm px-3 py-2 rounded-md border border-border">Active sessions</button>
        </Panel>
      </div>
    </div></>);
}
