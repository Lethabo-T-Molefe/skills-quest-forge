import { useState } from "react";
import { toast } from "sonner";
import { Chip, QuietButton, ScrollPane, SearchField } from "@/components";
import { canAdmin, useCurrentUser, useOrgMembers } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

export function AdminPage() {
  const user = useCurrentUser();
  const members = useOrgMembers();
  const [query, setQuery] = useState("");
  const mayEdit = canAdmin(user);
  const shown = members.filter((member) =>
    `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <MainLayout
      title="Users and roles"
      description="A role decides what a member can see and do, and how much compute, storage and AI they may use. Every change is written to the audit trail."
      fill
    >
      <div className="flex flex-col gap-3 lg:h-full">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField className="max-w-sm" value={query} onChange={setQuery} placeholder="Find a member" />
          {!mayEdit ? (
            <p className="text-xs text-muted-foreground">
              Only an administrator can change roles and quotas. Switch role in Settings to preview the admin view.
            </p>
          ) : null}
        </div>
        <ScrollPane className="min-h-[320px] border border-border bg-surface-raised lg:min-h-0 lg:flex-1" orientation="both">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Member</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Compute</th>
                <th className="px-4 py-2.5 font-medium">Storage</th>
                <th className="px-4 py-2.5 font-medium">AI</th>
                <th className="px-4 py-2.5 font-medium">Last active</th>
                <th className="px-4 py-2.5 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Chip>{member.role}</Chip>
                  </td>
                  <td className="num px-4 py-2.5 text-muted-foreground">{member.quotas.compute}</td>
                  <td className="num px-4 py-2.5 text-muted-foreground">{member.quotas.storage}</td>
                  <td className="num px-4 py-2.5 text-muted-foreground">{member.quotas.ai}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{member.lastActive}</td>
                  <td className="px-4 py-2.5 text-right">
                    <QuietButton
                      className="px-3 py-1.5 text-xs"
                      disabled={!mayEdit}
                      onClick={() => toast.success(`Editing ${member.name}`, { description: "The change will be written to the audit trail." })}
                    >
                      Edit
                    </QuietButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollPane>
      </div>
    </MainLayout>
  );
}
