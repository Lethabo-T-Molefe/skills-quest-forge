import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Field, Segmented, SignalButton, TextInput } from "@/components";
import { orgMembersQuery, useCurrentUser } from "@/features/auth";

export type ShareVisibility = "private" | "team" | "organisation";

interface SharedMember {
  id: string;
  name: string;
  email: string;
}

const visibilityOptions: { value: ShareVisibility; label: string; hint: string }[] = [
  { value: "private", label: "Only me", hint: "You, and the people you add below" },
  { value: "team", label: "My team", hint: "Everyone in your team" },
  { value: "organisation", label: "Everyone", hint: "Every member of the organisation" },
];

/**
 * Who can see something: a visibility level, plus named people. Each change is saved as it is made.
 * Sharing never widens what a viewer may see: rows and columns their role cannot read stay hidden.
 */
export function SharePanel({
  visibility,
  members,
  canEdit,
  busy = false,
  onVisibilityChange,
  onAdd,
  onRemove,
}: {
  visibility: ShareVisibility;
  members: SharedMember[];
  /** Only the owner (or an administrator) changes sharing. Others see who it is shared with. */
  canEdit: boolean;
  busy?: boolean;
  onVisibilityChange: (visibility: ShareVisibility) => void;
  onAdd: (email: string) => Promise<unknown>;
  onRemove?: (member: SharedMember) => void;
}) {
  const user = useCurrentUser();
  const directory = useQuery({ ...orgMembersQuery(), enabled: canEdit });
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const shared = new Set(members.map((member) => member.email));
  const suggestions = (directory.data ?? []).filter(
    (member) => member.id !== user.id && !shared.has(member.email),
  );

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await onAdd(email.trim());
      setEmail("");
    } catch {
      // The caller reports the reason; the address stays in the box to be corrected.
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Sharing never overrides the viewer&apos;s own permissions. Rows and columns their role
        cannot read stay hidden.
      </p>

      <div>
        <p className="mb-2 text-sm font-medium">Who can see it</p>
        {canEdit ? (
          <Segmented
            label="Who can see it"
            value={visibility}
            onValueChange={onVisibilityChange}
            options={visibilityOptions.map((option) => ({ ...option, disabled: busy }))}
          />
        ) : (
          <p className="text-sm">
            {visibilityOptions.find((option) => option.value === visibility)?.hint}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium">Shared with named people</p>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nobody has been added by name.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border border border-border">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{member.name}</span>
                  <span className="block text-xs break-all text-muted-foreground">
                    {member.email}
                  </span>
                </span>
                {canEdit && onRemove ? (
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => onRemove(member)}
                  >
                    <X className="size-4" strokeWidth={1.75} aria-hidden />
                    <span className="sr-only">Stop sharing with {member.name}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canEdit ? (
        <form className="space-y-3" onSubmit={(event) => void add(event)}>
          <Field label="Add a member by email" hint="They must already have a DataForge account.">
            <TextInput
              type="email"
              list="share-members"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@organisation.org"
              autoComplete="off"
              required
            />
          </Field>
          <datalist id="share-members">
            {suggestions.map((member) => (
              <option key={member.id} value={member.email}>
                {member.name}
              </option>
            ))}
          </datalist>
          <SignalButton type="submit" disabled={adding || !email.trim()}>
            {adding ? "Adding…" : "Share"}
          </SignalButton>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">
          Only the owner can change who this is shared with.
        </p>
      )}
    </div>
  );
}
