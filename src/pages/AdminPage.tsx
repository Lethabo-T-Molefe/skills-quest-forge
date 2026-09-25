import { toast } from "sonner";
import { Chip, HelpTip, Panel, QuietButton, ScrollPane } from "@/components";
import { canAdmin, useCurrentUser, useOrgMembers } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

export function AdminPage() {
  const user = useCurrentUser();
  const members = useOrgMembers();

  return (
    <MainLayout
      label="one organisation, one instance"
      title="Users, roles and quotas"
      intro="A role bundles the permissions that decide what a member can see and do, and the quotas that decide how much compute, storage and AI usage they may consume."
    >
      {!canAdmin(user) ? (
        <Panel>
          <p className="text-sm">
            You can inspect the directory, but only an Administrator can change roles and quotas. Switch role in
            Settings to preview the admin path.
          </p>
        </Panel>
      ) : null}

      <ScrollPane className="mt-6 h-[32rem] border border-border" orientation="both">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Member</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Compute</th>
              <th className="px-4 py-2.5 font-medium">Storage</th>
              <th className="px-4 py-2.5 font-medium">AI</th>
              <th className="px-4 py-2.5 font-medium">Last active</th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Chip>{member.role}</Chip>
                </td>
                <td className="num px-4 py-3 text-muted-foreground">{member.quotas.compute}</td>
                <td className="num px-4 py-3 text-muted-foreground">{member.quotas.storage}</td>
                <td className="num px-4 py-3 text-muted-foreground">{member.quotas.ai}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.lastActive}</td>
                <td className="px-4 py-3">
                  <QuietButton
                    disabled={!canAdmin(user)}
                    onClick={() => toast.success(`Role change for ${member.name} would be written to the audit log.`)}
                  >
                    Edit
                  </QuietButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollPane>
      <div className="mt-6">
        <HelpTip>
          There is no tenant separation. One organisation runs one DataForge instance. Row-level and column-level
          security further restrict what each role may read.
        </HelpTip>
      </div>
    </MainLayout>
  );
}
