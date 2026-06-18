import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { auditLog } from "@/lib/mock-data";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/app/audit")({ component: Page });

const tone: Record<string, any> = {
  LOGIN:"info", UPLOAD:"success", VIEW:"muted", DOWNLOAD:"warn",
  DELETE:"danger", ROLE_CHANGE:"accent", EXPORT:"info",
};

function Page() {
  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Immutable event trail · 30-day window shown" actions={
        <button className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-2"><Download className="size-4"/> Export CSV</button>
      } />
      <Panel title="Events">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-muted border border-border flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground"/><input placeholder="Search user, object, IP…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>All actions</option></select>
        </div>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Timestamp</th><th>User</th><th>Action</th><th>Object</th><th>Name</th><th>IP</th><th>Status</th></tr></thead>
          <tbody>{auditLog.map((l,i)=>(
            <tr key={i} className="border-t border-border">
              <td className="py-2 font-mono">{l.ts}</td><td>{l.user}</td>
              <td><Badge tone={tone[l.action]}>{l.action}</Badge></td>
              <td>{l.obj}</td><td className="font-mono text-muted-foreground">{l.name}</td>
              <td className="font-mono text-muted-foreground">{l.ip}</td>
              <td><Badge tone={l.status==="Success"?"success":"danger"}>{l.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </Panel>
    </>
  );
}
