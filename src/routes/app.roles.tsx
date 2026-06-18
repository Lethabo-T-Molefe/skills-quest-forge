import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Check, X } from "lucide-react";
export const Route = createFileRoute("/app/roles")({ component: Page });

const roles = ["System Admin","Data Steward","Data Engineer","Data Analyst","Data Scientist","Student Dev","Viewer / Exec","Auditor"];
const perms = ["Upload data","Approve datasets","Query SQL","Build dashboards","Run ML","Manage users","View audit logs","Export reports"];
const matrix: Record<string,boolean[]> = {
  "System Admin":      [1,1,1,1,1,1,1,1].map(Boolean),
  "Data Steward":      [0,1,1,1,0,0,1,1].map(Boolean),
  "Data Engineer":     [1,0,1,1,0,0,0,1].map(Boolean),
  "Data Analyst":      [0,0,1,1,0,0,0,1].map(Boolean),
  "Data Scientist":    [0,0,1,1,1,0,0,1].map(Boolean),
  "Student Dev":       [0,0,0,0,0,0,0,0].map(Boolean),
  "Viewer / Exec":     [0,0,0,1,0,0,0,1].map(Boolean),
  "Auditor":           [0,0,0,0,0,0,1,1].map(Boolean),
};

function Page() {
  return (
    <>
      <PageHeader title="Role Management" subtitle="Permission matrix · 8 roles" />
      <Panel title="Permissions">
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead><tr><th className="text-left py-2 pr-4">Role</th>{perms.map(p=>(<th key={p} className="px-3 text-[11px] font-medium text-muted-foreground">{p}</th>))}</tr></thead>
            <tbody>{roles.map(r=>(
              <tr key={r} className="border-t border-border">
                <td className="py-2 pr-4 font-medium whitespace-nowrap">{r}</td>
                {matrix[r].map((on,i)=>(<td key={i} className="px-3 text-center">{on ? <Check className="size-4 text-success inline"/> : <X className="size-4 text-muted-foreground/40 inline"/>}</td>))}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2"><Badge tone="info">Edit Roles</Badge><Badge tone="muted">Read-only view</Badge></div>
      </Panel>
    </>
  );
}
