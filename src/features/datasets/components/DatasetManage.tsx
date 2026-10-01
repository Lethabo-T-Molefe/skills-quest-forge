import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Field,
  Notice,
  QuietButton,
  SelectMenu,
  SignalButton,
  TextArea,
  TextInput,
} from "@/components";
import { canApprove, hasPermission, useCurrentUser } from "@/features/auth";
import { notifyError } from "@/lib/notify";
import {
  eraseDataset,
  promoteDataset,
  refreshDatasets,
  updateDataset,
  uploadDatasetVersion,
} from "../api/datasets";
import { classificationHint, classificationLabel } from "../constants";
import type { Classification, Dataset } from "../types";

const classifications = Object.keys(classificationLabel) as Classification[];

/** Everything an owner or steward can change about a dataset: its details, a new version, promotion, erasure. */
export function DatasetManage({ dataset, onDone }: { dataset: Dataset; onDone: () => void }) {
  const user = useCurrentUser();
  const isOwner = dataset.ownerId === user.id;
  const isAdmin = user.roleId === "admin";
  const maySettings = isOwner || isAdmin || hasPermission(user, "manage_policies");
  const mayPromote =
    canApprove(user) && dataset.layer === "silver" && dataset.status === "approved";

  return (
    <div className="space-y-8">
      {maySettings ? (
        <SettingsForm dataset={dataset} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Only the owner or a steward can change this dataset&apos;s details.
        </p>
      )}
      {isOwner || isAdmin ? <NewVersion dataset={dataset} /> : null}
      {mayPromote ? <Promote dataset={dataset} /> : null}
      {isOwner || isAdmin ? <Erase dataset={dataset} onDone={onDone} /> : null}
    </div>
  );
}

function SettingsForm({ dataset }: { dataset: Dataset }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(dataset.name);
  const [description, setDescription] = useState(dataset.description);
  const [classification, setClassification] = useState(dataset.classification);

  const save = useMutation({
    mutationFn: () => updateDataset(dataset.id, { name, description, classification }),
    onSuccess: async () => {
      await refreshDatasets(queryClient);
      toast.success("Dataset details saved");
    },
    onError: notifyError("The details could not be saved."),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <h3 className="font-sans text-sm font-medium">Details</h3>
      <Field label="Name">
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={200}
          required
        />
      </Field>
      <Field label="Description">
        <TextArea
          rows={3}
          className="font-sans"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={4000}
        />
      </Field>
      <SelectMenu
        label="Classification"
        value={classification}
        onValueChange={(value) => setClassification(value as Classification)}
        options={classifications.map((value) => ({ value, label: classificationLabel[value] }))}
      />
      <p className="-mt-2 text-xs text-muted-foreground">{classificationHint[classification]}</p>
      <SignalButton type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save details"}
      </SignalButton>
    </form>
  );
}

function NewVersion({ dataset }: { dataset: Dataset }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadDatasetVersion(dataset.id, file),
    onSuccess: async (updated) => {
      await refreshDatasets(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["cleaning"] });
      toast.success(`Version ${updated.version} landed`, {
        description: "Rerun the saved recipe to clean it the same way.",
      });
    },
    onError: notifyError("The new version could not be uploaded."),
    onSettled: () => {
      if (input.current) input.current.value = "";
    },
  });

  return (
    <section className="border-t border-border pt-6">
      <h3 className="font-sans text-sm font-medium">Upload a new version</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        A newer file of the same data. It lands as version {dataset.version + 1}; the earlier
        versions are kept, and the saved cleaning recipe can be rerun on it.
      </p>
      <input
        ref={input}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,.xls,.json"
        className="sr-only"
        aria-label="File for the new version"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate(file);
        }}
      />
      <QuietButton
        className="mt-3"
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
      >
        {upload.isPending ? "Uploading and profiling…" : "Choose a file"}
      </QuietButton>
    </section>
  );
}

function Promote({ dataset }: { dataset: Dataset }) {
  const queryClient = useQueryClient();
  const promote = useMutation({
    mutationFn: () => promoteDataset(dataset.id),
    onSuccess: async () => {
      await refreshDatasets(queryClient);
      toast.success(`${dataset.name} promoted to gold`, {
        description: "Personal columns were left out of the gold table.",
      });
    },
    onError: notifyError("The dataset could not be promoted."),
  });

  return (
    <section className="border-t border-border pt-6">
      <h3 className="font-sans text-sm font-medium">Promote to gold</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Gold is the analytics-ready copy used by dashboards and shared metrics. Personal columns
        never reach it.
      </p>
      <QuietButton className="mt-3" disabled={promote.isPending} onClick={() => promote.mutate()}>
        {promote.isPending ? "Promoting…" : "Promote to gold"}
      </QuietButton>
    </section>
  );
}

function Erase({ dataset, onDone }: { dataset: Dataset; onDone: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");

  const erase = useMutation({
    mutationFn: () => eraseDataset(dataset.id, reason.trim() || "Right to erasure"),
    onSuccess: async (receipt) => {
      onDone();
      await navigate({ to: "/datasets" });
      await refreshDatasets(queryClient);
      toast.success(`${dataset.name} erased`, {
        description: `Receipt ${receipt.receipt.slice(0, 12)}… is in the audit trail.`,
        duration: 10_000,
      });
    },
    onError: notifyError("The dataset could not be erased."),
  });

  return (
    <section className="border-t border-border pt-6">
      <h3 className="font-sans text-sm font-medium">Erase this dataset</h3>
      <Notice className="mt-2" tone="signal" title="This cannot be undone">
        Every table and landed file is removed, in every layer. Charts and monitors that use it stop
        working. A receipt is written to the audit trail.
      </Notice>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          erase.mutate();
        }}
      >
        <Field label="Reason" hint="For example, a right-to-erasure request.">
          <TextInput
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Right to erasure"
            maxLength={2000}
          />
        </Field>
        <Field label={`Type ${dataset.id} to confirm`}>
          <TextInput
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <SignalButton type="submit" disabled={typed !== dataset.id || erase.isPending}>
          {erase.isPending ? "Erasing…" : "Erase permanently"}
        </SignalButton>
      </form>
    </section>
  );
}
