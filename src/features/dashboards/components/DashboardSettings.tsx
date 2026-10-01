import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CodeBlock,
  Field,
  Notice,
  QuietButton,
  SignalButton,
  TextArea,
  TextInput,
} from "@/components";
import { SharePanel, type ShareVisibility } from "@/features/sharing";
import { notifyError } from "@/lib/notify";
import {
  deleteDashboard,
  embedPageUrl,
  setEmbedding,
  shareDashboard,
  unshareDashboard,
  updateDashboard,
} from "../api/dashboards";
import type { Dashboard } from "../types";

const refreshKeys = [["dashboards"], ["audit"], ["search"]];

function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(refreshKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

/** Who can see a dashboard. Viewers always see its charts computed under their own role. */
export function DashboardSharing({ dashboard }: { dashboard: Dashboard }) {
  const refresh = useRefresh();

  const visibility = useMutation({
    mutationFn: (next: ShareVisibility) => updateDashboard(dashboard.id, { visibility: next }),
    onSuccess: async () => {
      await refresh();
      toast.success("Visibility saved");
    },
    onError: notifyError("The visibility could not be changed."),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => unshareDashboard(dashboard.id, userId),
    onSuccess: refresh,
    onError: notifyError("Sharing could not be changed."),
  });

  async function add(email: string) {
    try {
      await shareDashboard(dashboard.id, [email]);
      await refresh();
      toast.success(`Shared with ${email}`);
    } catch (error) {
      notifyError("The dashboard could not be shared.")(error);
      throw error;
    }
  }

  return (
    <SharePanel
      visibility={dashboard.visibility.toLowerCase() as ShareVisibility}
      members={dashboard.sharedMembers ?? []}
      canEdit={dashboard.canEdit}
      busy={visibility.isPending}
      onVisibilityChange={(next) => visibility.mutate(next)}
      onAdd={add}
      onRemove={(member) => remove.mutate(member.id)}
    />
  );
}

/** The owner's controls: rename, embed in another internal application, and delete. */
export function DashboardManage({
  dashboard,
  onDone,
}: {
  dashboard: Dashboard;
  onDone: () => void;
}) {
  const refresh = useRefresh();
  const navigate = useNavigate();
  const [name, setName] = useState(dashboard.name);
  const [description, setDescription] = useState(dashboard.description);
  const [confirming, setConfirming] = useState(false);

  const save = useMutation({
    mutationFn: () => updateDashboard(dashboard.id, { name: name.trim(), description }),
    onSuccess: async () => {
      await refresh();
      toast.success("Dashboard details saved");
    },
    onError: notifyError("The details could not be saved."),
  });

  const embed = useMutation({
    mutationFn: (enabled: boolean) => setEmbedding(dashboard.id, enabled),
    onSuccess: async (result) => {
      await refresh();
      toast.success(result.embedEnabled ? "Embedding is on" : "Embedding is off");
    },
    onError: notifyError("Embedding could not be changed."),
  });

  const remove = useMutation({
    mutationFn: () => deleteDashboard(dashboard.id),
    onSuccess: async () => {
      onDone();
      await navigate({ to: "/dashboards" });
      await refresh();
      toast.success(`${dashboard.name} deleted`);
    },
    onError: notifyError("The dashboard could not be deleted."),
  });

  const embedUrl = embed.data?.token ? embedPageUrl(dashboard.id, embed.data.token) : null;
  const organisation = dashboard.visibility === "Organisation";

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Name">
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            required
          />
        </Field>
        <Field label="What it is for">
          <TextArea
            rows={3}
            className="font-sans"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
          />
        </Field>
        <SignalButton type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save details"}
        </SignalButton>
      </form>

      <section className="border-t border-border pt-6">
        <h3 className="font-sans text-sm font-medium">Embed in another internal application</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          An embed is read-only and shows organisation-wide data only. The link is signed and
          expires, so it can be placed in an intranet page without a DataForge sign-in.
        </p>
        {!organisation ? (
          <p className="mt-2 text-sm text-warning">
            Only dashboards shared with everyone can be embedded. Change who can see it first.
          </p>
        ) : (
          <QuietButton
            className="mt-3"
            disabled={embed.isPending}
            onClick={() => embed.mutate(!dashboard.embedEnabled)}
          >
            {embed.isPending
              ? "Saving…"
              : dashboard.embedEnabled
                ? "Turn embedding off"
                : "Turn embedding on"}
          </QuietButton>
        )}
        {dashboard.embedEnabled && organisation && !embedUrl ? (
          <QuietButton
            className="mt-3 ml-2"
            disabled={embed.isPending}
            onClick={() => embed.mutate(true)}
          >
            Get a new link
          </QuietButton>
        ) : null}
        {embedUrl ? (
          <div className="mt-4 space-y-2">
            <CodeBlock
              code={`<iframe src="${embedUrl}" title="${dashboard.name}" width="100%" height="720"></iframe>`}
              label="Embed code"
            />
            <p className="text-xs text-muted-foreground">
              Valid for {embed.data?.expiresInHours} hours. It is shown once: copy it now, or make a
              new one later.
            </p>
          </div>
        ) : null}
      </section>

      <section className="border-t border-border pt-6">
        <h3 className="font-sans text-sm font-medium">Delete this dashboard</h3>
        {confirming ? (
          <Notice
            className="mt-2"
            tone="signal"
            title="Delete it for everyone?"
            action={
              <div className="flex flex-wrap gap-2">
                <SignalButton disabled={remove.isPending} onClick={() => remove.mutate()}>
                  {remove.isPending ? "Deleting…" : "Delete the dashboard"}
                </SignalButton>
                <QuietButton onClick={() => setConfirming(false)}>Keep it</QuietButton>
              </div>
            }
          >
            Its charts are removed for every viewer. The data and the metrics behind them are not
            touched.
          </Notice>
        ) : (
          <QuietButton className="mt-3" onClick={() => setConfirming(true)}>
            Delete
          </QuietButton>
        )}
      </section>
    </div>
  );
}
