import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Check, X } from "lucide-react";
import { useRoles, useAllRolePermissions } from "@/lib/queries/roles";

export const Route = createFileRoute("/app/roles")({ component: Page });

function Page() {
  const { data: roleInfos = [], isLoading } = useRoles();
  const roleNames = roleInfos.map((r) => r.role);
  const permissionQueries = useAllRolePermissions(roleNames);

  // Column headers: the set of permission names, taken from whichever role's
  // permissions loaded first (every role is seeded with the same full set).
  const perms =
    permissionQueries.find((q) => q.data && q.data.length > 0)?.data?.map((p) => p.permission) ??
    [];

  const matrix: Record<string, Record<string, boolean>> = {};
  roleNames.forEach((role, i) => {
    const rows = permissionQueries[i]?.data ?? [];
    matrix[role] = Object.fromEntries(rows.map((p) => [p.permission, p.granted]));
  });

  return (
    <>
      <PageHeader title="Role Management" subtitle={`Permission matrix · ${isLoading ? "…" : roleNames.length} roles`} />
      <Panel title="Permissions">
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4">Role</th>
                {perms.map((p) => (
                  <th key={p} className="px-3 text-[11px] font-medium text-muted-foreground">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roleNames.map((r) => (
                <tr key={r} className="border-t border-border">
                  <td className="py-2 pr-4 font-medium whitespace-nowrap">{r}</td>
                  {perms.map((p) => (
                    <td key={p} className="px-3 text-center">
                      {matrix[r]?.[p] ? (
                        <Check className="size-4 text-success inline" />
                      ) : (
                        <X className="size-4 text-muted-foreground/40 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <Badge tone="info">Edit Roles</Badge>
          <Badge tone="muted">Read-only view</Badge>
        </div>
      </Panel>
    </>
  );
}
