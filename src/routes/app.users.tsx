import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
export const Route = createFileRoute("/app/users")({ component: Page });

const users = [
  { name:"T. Mokoena", email:"t.mokoena@chieta.org.za", role:"System Admin", status:"Active", last:"2 min ago" },
  { name:"S. Naidoo", email:"s.naidoo@chieta.org.za", role:"Data Steward", status:"Active", last:"1 hr ago" },
  { name:"K. Botha", email:"k.botha@chieta.org.za", role:"Data Engineer", status:"Active", last:"Today, 08:14" },
  { name:"L. Patel", email:"l.patel@chieta.org.za", role:"Data Scientist", status:"Active", last:"Today, 09:14" },
  { name:"M. Dlamini", email:"m.dlamini@chieta.org.za", role:"Data Analyst", status:"Active", last:"Yesterday" },
  { name:"P. van Wyk", email:"p.vw@chieta.org.za", role:"Viewer / Executive", status:"Active", last:"3 days ago" },
  { name:"B. Khumalo", email:"b.khumalo@chieta.org.za", role:"Auditor", status:"Active", last:"1 week ago" },
  { name:"R. Mahlangu", email:"r.mahlangu@cput.ac.za", role:"Student Developer", status:"Active", last:"Today, 11:22" },
  { name:"J. de Beer", email:"j.debeer@chieta.org.za", role:"Data Engineer", status:"Inactive", last:"3 months ago" },
];

function Page() {
  return (
    <>
      <PageHeader title="User Management" subtitle={`${users.length} users · role-based access control`} actions={
        <button className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground">+ Add User</button>
      } />
      <Panel title="All users">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th>Status</th><th className="text-left">Last login</th><th></th></tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.email} className="border-t border-border">
              <td className="py-2 font-medium">{u.name}</td><td className="text-muted-foreground">{u.email}</td>
              <td>{u.role}</td><td><Badge tone={u.status==="Active"?"success":"muted"}>{u.status}</Badge></td>
              <td className="text-muted-foreground">{u.last}</td>
              <td className="text-right"><button className="text-xs text-primary mr-3">Edit</button><button className="text-xs text-danger">Deactivate</button></td>
            </tr>
          ))}</tbody>
        </table>
      </Panel>
    </>
  );
}
