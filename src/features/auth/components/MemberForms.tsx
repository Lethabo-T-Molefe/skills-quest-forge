import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field, Segmented, SelectMenu, SignalButton, TextInput } from "@/components";
import { notifyError } from "@/lib/notify";
import { inviteMember, rolesQuery, updateMember } from "../api/current-user";
import { roleLabels } from "../constants";
import type { OrgMember, QuotaLimits, RoleId } from "../types";

const roles = Object.keys(roleLabels) as RoleId[];
const roleOptions = roles.map((value) => ({ value, label: roleLabels[value] }));
const HOUR = 3600;
const GB = 1024 ** 3;

function useRefreshMembers() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [["auth"], ["audit"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

/** Text for a quota box: empty when the member is on the role's default, otherwise the override. */
function asText(
  value: number | null | undefined,
  roleDefault: number | null | undefined,
  unit: number,
) {
  if (value === null || value === undefined || value === roleDefault) return "";
  return String(Math.round((value / unit) * 100) / 100);
}

/** A quota box back to raw units: empty means the role's default. */
function asLimit(text: string, unit: number): number | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : Math.round(Number(trimmed) * unit);
}

function describe(limit: number | null | undefined, unit: number, suffix: string) {
  if (limit === undefined) return "the role's default";
  return limit === null ? "unlimited" : `${Math.round((limit / unit) * 100) / 100} ${suffix}`;
}

/** Change a member's role, team, status and monthly quotas. Every change is written to the audit trail. */
export function EditMemberForm({ member, onSaved }: { member: OrgMember; onSaved: () => void }) {
  const refresh = useRefreshMembers();
  const roleInfo = useQuery(rolesQuery());
  const [role, setRole] = useState<RoleId>(member.roleId);
  const [team, setTeam] = useState(member.team ?? "");
  const [status, setStatus] = useState<"active" | "disabled">(member.status ?? "active");
  const defaults = roleInfo.data?.find((item) => item.id === role)?.quotas;
  const current = roleInfo.data?.find((item) => item.id === member.roleId)?.quotas;
  const [compute, setCompute] = useState<string | null>(null);
  const [storage, setStorage] = useState<string | null>(null);
  const [ai, setAi] = useState<string | null>(null);
  // Until a box is edited it shows the member's override, if they have one.
  const computeText =
    compute ?? asText(member.limits?.computeSeconds, current?.computeSeconds, HOUR);
  const storageText = storage ?? asText(member.limits?.storageBytes, current?.storageBytes, GB);
  const aiText = ai ?? asText(member.limits?.aiQueries, current?.aiQueries, 1);

  const save = useMutation({
    mutationFn: () => {
      const quotas: QuotaLimits = {
        computeSeconds: asLimit(computeText, HOUR),
        storageBytes: asLimit(storageText, GB),
        aiQueries: asLimit(aiText, 1),
      };
      return updateMember(member.id, {
        role,
        status,
        team: team.trim() || null,
        quotas,
      });
    },
    onSuccess: async (updated) => {
      await refresh();
      toast.success(`${updated.name} updated`, {
        description: "The change is in the audit trail and applies from their next request.",
      });
      onSaved();
    },
    onError: notifyError("The member could not be updated."),
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <p className="text-sm text-muted-foreground">
        {member.email}
        {member.verified === false ? " · email not verified" : ""}
        {member.mfaEnabled ? " · multi-factor on" : ""}
      </p>
      <SelectMenu
        label="Role"
        value={role}
        onValueChange={(value) => setRole(value as RoleId)}
        options={roleOptions}
      />
      <Field label="Team" hint="Members of the same team see what is shared with the team.">
        <TextInput
          value={team}
          onChange={(event) => setTeam(event.target.value)}
          placeholder="Learning operations"
          maxLength={120}
        />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-medium">Account</p>
        <Segmented
          label="Account status"
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "active", label: "Active" },
            { value: "disabled", label: "Disabled", hint: "They can no longer sign in" },
          ]}
        />
      </div>
      <fieldset className="space-y-4 border-t border-border pt-5">
        <legend className="text-sm font-medium">Monthly quotas</legend>
        <p className="text-xs text-muted-foreground">
          Leave a box empty to use the role&apos;s default.
        </p>
        <Field
          label="Sandbox compute, in hours"
          hint={`Role default: ${describe(defaults?.computeSeconds, HOUR, "hours")}.`}
        >
          <TextInput
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={computeText}
            onChange={(event) => setCompute(event.target.value)}
          />
        </Field>
        <Field
          label="Storage, in GB"
          hint={`Role default: ${describe(defaults?.storageBytes, GB, "GB")}.`}
        >
          <TextInput
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={storageText}
            onChange={(event) => setStorage(event.target.value)}
          />
        </Field>
        <Field
          label="Assistant questions"
          hint={`Role default: ${describe(defaults?.aiQueries, 1, "questions")}.`}
        >
          <TextInput
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={aiText}
            onChange={(event) => setAi(event.target.value)}
          />
        </Field>
      </fieldset>
      <SignalButton type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save changes"}
      </SignalButton>
    </form>
  );
}

/** Add a member. They are emailed a link to choose their own password. */
export function InviteMemberForm({ onInvited }: { onInvited: () => void }) {
  const refresh = useRefreshMembers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleId>("analyst");
  const [team, setTeam] = useState("");

  const invite = useMutation({
    mutationFn: () =>
      inviteMember({
        name: name.trim(),
        email: email.trim(),
        role,
        ...(team.trim() ? { team: team.trim() } : {}),
      }),
    onSuccess: async (member) => {
      await refresh();
      toast.success(`${member.name} invited`, {
        description: `A link to choose a password was sent to ${member.email}.`,
      });
      onInvited();
    },
    onError: notifyError("The member could not be invited."),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        invite.mutate();
      }}
    >
      <Field label="Full name">
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
          maxLength={200}
          required
        />
      </Field>
      <Field label="Work email">
        <TextInput
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="off"
          required
        />
      </Field>
      <SelectMenu
        label="Role"
        value={role}
        onValueChange={(value) => setRole(value as RoleId)}
        options={roleOptions}
      />
      <Field label="Team (optional)">
        <TextInput
          value={team}
          onChange={(event) => setTeam(event.target.value)}
          placeholder="Learning operations"
          maxLength={120}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        They receive an email with a link to choose their own password. You never see it.
      </p>
      <SignalButton type="submit" disabled={invite.isPending}>
        {invite.isPending ? "Sending the invitation…" : "Invite"}
      </SignalButton>
    </form>
  );
}
