import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Panel, QuietButton } from "@/components";
import { applyRole, roleLabels, useCurrentUser, type RoleId } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

const roles = Object.entries(roleLabels) as [RoleId, string][];

export function SettingsPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();

  return (
    <MainLayout
      title="Settings"
      description="Your identity, role and fair-use quotas. In this prototype you can also switch role to see how the screens change for other people."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="heading-2">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Workspace</dt>
              <dd>{user.workspace}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email verified</dt>
              <dd>{user.verified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Multi-factor</dt>
              <dd>{user.mfaEnabled ? "On" : "Off"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="heading-2">Quotas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-muted-foreground">Compute</span>
              <span className="num">{user.quotas.compute}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted-foreground">Storage</span>
              <span className="num">{user.quotas.storage}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted-foreground">AI queries</span>
              <span className="num">{user.quotas.ai}</span>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6">
        <h2 id="preview-role" className="heading-2">
          Preview another role
        </h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          Production role changes go through an Administrator and are written to the audit log. This switch is for the
          prototype only.
        </p>
        {/* A labelled group, not a <label>: a label would attach itself to the first button only. */}
        <div role="group" aria-labelledby="preview-role">
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map(([id, label]) => (
              <QuietButton
                key={id}
                aria-pressed={user.roleId === id}
                active={user.roleId === id}
                onClick={() => {
                  applyRole(id);
                  void queryClient.invalidateQueries({ queryKey: ["auth"] });
                  toast.success(`Now previewing as ${label}`, { description: "The menu and actions now match this role." });
                }}
              >
                {label}
              </QuietButton>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Chip>Current · {user.role}</Chip>
        </div>
      </Panel>
    </MainLayout>
  );
}
