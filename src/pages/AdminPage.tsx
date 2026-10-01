import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Chip,
  Drawer,
  Notice,
  QuietButton,
  SearchField,
  SignalButton,
  TableFrame,
} from "@/components";
import {
  EditMemberForm,
  InviteMemberForm,
  canAdmin,
  useCurrentUser,
  useOrgMembers,
  type OrgMember,
} from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

export function AdminPage() {
  const user = useCurrentUser();
  const members = useOrgMembers();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<OrgMember | null>(null);
  const [inviting, setInviting] = useState(false);
  const mayEdit = canAdmin(user);
  const shown = members.filter((member) =>
    `${member.name} ${member.email} ${member.role} ${member.team ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <MainLayout
      title="Users and roles"
      description="A role decides what a member can see and do, and how much compute, storage and AI they may use. Every change is written to the audit trail."
      actions={
        mayEdit ? (
          <SignalButton onClick={() => setInviting(true)}>
            <UserPlus className="size-4" strokeWidth={1.75} aria-hidden />
            Invite a member
          </SignalButton>
        ) : null
      }
    >
      <div className="flex flex-col gap-4">
        {!mayEdit ? (
          <Notice tone="warn" title="You can see who is here, but not change them">
            Only an administrator changes roles, teams and quotas.
          </Notice>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            className="max-w-sm"
            value={query}
            onChange={setQuery}
            placeholder="Find a member"
          />
          <p className="num ml-auto text-xs text-muted-foreground">
            {shown.length} of {members.length} members
          </p>
        </div>
        <TableFrame label="Members">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Member
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Role
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Team
                </th>
                {mayEdit ? (
                  <>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Compute
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Storage
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      AI
                    </th>
                  </>
                ) : null}
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Last active
                </th>
                {mayEdit ? (
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {shown.map((member) => (
                <tr key={member.id} className="border-b border-border align-top last:border-0">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs break-all text-muted-foreground">{member.email}</p>
                  </th>
                  <td className="px-4 py-2.5">
                    <Chip>{member.role}</Chip>
                    {member.status === "disabled" ? (
                      <span className="ml-1.5">
                        <Chip tone="signal">disabled</Chip>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{member.team ?? "—"}</td>
                  {mayEdit ? (
                    <>
                      <td className="num px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                        {member.quotas?.compute ?? "—"}
                      </td>
                      <td className="num px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                        {member.quotas?.storage ?? "—"}
                      </td>
                      <td className="num px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                        {member.quotas?.ai ?? "—"}
                      </td>
                    </>
                  ) : null}
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {member.lastActive}
                  </td>
                  {mayEdit ? (
                    <td className="px-4 py-2.5 text-right">
                      <QuietButton
                        className="px-3 py-1.5 text-xs"
                        onClick={() => setEditing(member)}
                      >
                        Edit<span className="sr-only"> {member.name}</span>
                      </QuietButton>
                    </td>
                  ) : null}
                </tr>
              ))}
              {shown.length === 0 ? (
                <tr>
                  <td
                    colSpan={mayEdit ? 8 : 4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No member matches “{query}”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </TableFrame>
        {mayEdit ? (
          <p className="text-xs text-muted-foreground">
            Quotas show this month&apos;s use against the limit. They reset on the first of the
            month.
          </p>
        ) : null}
      </div>

      <Drawer
        open={editing !== null}
        title={editing ? `Edit ${editing.name}` : "Edit member"}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditMemberForm key={editing.id} member={editing} onSaved={() => setEditing(null)} />
        ) : null}
      </Drawer>

      <Drawer open={inviting} title="Invite a member" onClose={() => setInviting(false)}>
        <InviteMemberForm onInvited={() => setInviting(false)} />
      </Drawer>
    </MainLayout>
  );
}
