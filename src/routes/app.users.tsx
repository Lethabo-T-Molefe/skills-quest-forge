import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { useAssignUserRole, useCreateUser, useDeactivateUser, useUsers } from "@/lib/queries/users";
import { useRoles } from "@/lib/queries/roles";

export const Route = createFileRoute("/app/users")({ component: Page });

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) return "Never";
  return new Date(lastLoginAt).toLocaleString();
}

function Page() {
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const assignRole = useAssignUserRole();
  const deactivate = useDeactivateUser();
  const createUser = useCreateUser();
  const [editingId, setEditingId] = useState<number | null>(null);

  function handleAddUser() {
    const name = window.prompt("Name");
    if (!name) return;
    const email = window.prompt("Email");
    if (!email) return;
    const role = window.prompt(`Role (${roles.map((r) => r.role).join(", ")})`, roles[0]?.role ?? "");
    if (!role) return;
    createUser.mutate({ name, email, role });
  }

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle={`${isLoading ? "…" : users.length} users · role-based access control`}
        actions={
          <button
            className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={handleAddUser}
            disabled={createUser.isPending}
          >
            + Add User
          </button>
        }
      />
      <Panel title="All users">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr>
              <th className="text-left py-2">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th>Status</th>
              <th className="text-left">Last login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="py-2 font-medium">{u.name}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>
                  {editingId === u.id ? (
                    <select
                      className="bg-muted border border-border rounded-md h-8 px-2 text-xs"
                      defaultValue={u.role}
                      ref={(el) => el?.focus()}
                      disabled={assignRole.isPending}
                      onChange={(e) => {
                        assignRole.mutate({ id: u.id, role: e.target.value });
                        setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                    >
                      {roles.map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td>
                  <Badge tone={u.is_active ? "success" : "muted"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="text-muted-foreground">{formatLastLogin(u.last_login_at)}</td>
                <td className="text-right">
                  <button
                    className="text-xs text-primary mr-3"
                    onClick={() => setEditingId(u.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-danger disabled:opacity-40"
                    disabled={!u.is_active || deactivate.isPending}
                    onClick={() => deactivate.mutate(u.id)}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
