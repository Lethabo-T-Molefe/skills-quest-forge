import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field, SelectMenu, SignalButton, TextArea, TextInput } from "@/components";
import type { ShareVisibility } from "@/features/sharing";
import { notifyError } from "@/lib/notify";
import { createDashboard } from "../api/dashboards";

const visibilities: { value: ShareVisibility; label: string }[] = [
  { value: "private", label: "Only me" },
  { value: "team", label: "My team" },
  { value: "organisation", label: "Everyone" },
];

/** Start an empty dashboard. Charts are added to it from Analyse. */
export function NewDashboardForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ShareVisibility>("private");

  const create = useMutation({
    mutationFn: () => createDashboard({ name: name.trim(), description, visibility }),
    onSuccess: async (dashboard) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      toast.success(`${dashboard.name} created`, {
        description: "Build a chart in Analyse and save it here.",
      });
      await navigate({ to: "/dashboards/$dashboardId", params: { dashboardId: dashboard.id } });
    },
    onError: notifyError("The dashboard could not be created."),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        create.mutate();
      }}
    >
      <Field label="Name">
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enrolment health"
          maxLength={200}
          required
        />
      </Field>
      <Field label="What it is for (optional)">
        <TextArea
          rows={3}
          className="font-sans"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Volume and completion of enrolments for the learning operations team."
          maxLength={2000}
        />
      </Field>
      <SelectMenu
        label="Who can see it"
        value={visibility}
        onValueChange={(value) => setVisibility(value as ShareVisibility)}
        options={visibilities}
      />
      <SignalButton type="submit" disabled={create.isPending}>
        {create.isPending ? "Creating…" : "Create the dashboard"}
      </SignalButton>
    </form>
  );
}
