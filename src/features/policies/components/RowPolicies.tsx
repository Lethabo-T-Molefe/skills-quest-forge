import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Drawer,
  Field,
  Notice,
  QuietButton,
  SelectMenu,
  SignalButton,
  TableFrame,
  TextInput,
} from "@/components";
import { roleLabels, type RoleId } from "@/features/auth";
import { useDatasets } from "@/features/datasets";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { deleteRowPolicy, rowPoliciesQuery, setRowPolicy } from "../api/policies";

const roles = Object.keys(roleLabels) as RoleId[];

/**
 * Row-level security for stewards. A policy limits the rows of one dataset that one role can read, in every
 * tool: charts, answers, SQL, notebooks, dashboards and Superset all apply it.
 */
export function RowPolicies() {
  const queryClient = useQueryClient();
  const policies = useQuery(rowPoliciesQuery());
  const approved = useDatasets().filter((dataset) => dataset.queryable);
  const [open, setOpen] = useState(false);
  const [datasetId, setDatasetId] = useState("");
  const [role, setRole] = useState<RoleId>("analyst");
  const [predicate, setPredicate] = useState("");
  const [description, setDescription] = useState("");
  const chosen = approved.find((dataset) => dataset.id === datasetId) ?? approved[0];

  // Policies change what every analysis returns, so cached results are dropped.
  const refresh = () =>
    Promise.all(
      [["policies"], ["analysis"], ["dashboards"], ["sql"], ["audit"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );

  const save = useMutation({
    mutationFn: () => {
      if (!chosen) throw new Error("Choose a dataset.");
      return setRowPolicy({ datasetId: chosen.id, role, predicate, description });
    },
    onSuccess: async () => {
      await refresh();
      setOpen(false);
      setPredicate("");
      setDescription("");
      toast.success("Row policy saved", {
        description: `${roleLabels[role]} now reads only the matching rows.`,
      });
    },
    onError: notifyError("The policy could not be saved."),
  });

  const remove = useMutation({
    mutationFn: deleteRowPolicy,
    onSuccess: async () => {
      await refresh();
      toast.success("Row policy removed");
    },
    onError: notifyError("The policy could not be removed."),
  });

  return (
    <section aria-labelledby="policies-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="policies-heading" className="font-display text-xl">
            Row policies
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Limit the rows of a dataset that a role can read. The limit applies everywhere: charts,
            answers, SQL, notebooks and shared dashboards.
          </p>
        </div>
        <QuietButton disabled={approved.length === 0} onClick={() => setOpen(true)}>
          Add a row policy
        </QuietButton>
      </div>

      <div className="mt-4">
        {policies.isPending ? (
          <p className="text-sm text-muted-foreground">Loading policies…</p>
        ) : policies.isError ? (
          <Notice tone="signal" title="The policies did not load">
            {errorMessage(policies.error)}
          </Notice>
        ) : policies.data.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No row policies yet. Every role reads all rows of the datasets it can see.
          </p>
        ) : (
          <TableFrame label="Row policies">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Dataset
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Reads only rows where
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {policies.data.map((policy) => (
                  <tr key={policy.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5">{policy.dataset}</td>
                    <td className="px-4 py-2.5">{policy.roleLabel}</td>
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-[13px]">{policy.predicate}</code>
                      {policy.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {policy.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(policy.id)}
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
                        <span className="sr-only">
                          Remove the policy for {policy.roleLabel} on {policy.dataset}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        )}
      </div>

      <Drawer open={open} title="Add a row policy" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <SelectMenu
            label="Dataset"
            value={chosen?.id ?? ""}
            onValueChange={setDatasetId}
            options={approved.map((dataset) => ({ value: dataset.id, label: dataset.name }))}
          />
          <SelectMenu
            label="Role"
            value={role}
            onValueChange={(value) => setRole(value as RoleId)}
            options={roles.map((value) => ({ value, label: roleLabels[value] }))}
          />
          <Field
            label="Reads only rows where"
            hint={
              chosen
                ? `Compare columns with values. Columns: ${chosen.columns.map((c) => c.name).join(", ")}.`
                : "Compare columns with values."
            }
          >
            <TextInput
              className="font-mono"
              value={predicate}
              onChange={(event) => setPredicate(event.target.value)}
              placeholder="region = 'Gauteng'"
              spellCheck={false}
              required
              maxLength={2000}
            />
          </Field>
          <Field label="Why (optional)">
            <TextInput
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Regional managers see their own region"
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            A dataset holds one policy per role. Saving replaces the earlier one for this role.
          </p>
          <SignalButton type="submit" disabled={save.isPending || !chosen}>
            {save.isPending ? "Checking and saving…" : "Save the policy"}
          </SignalButton>
        </form>
      </Drawer>
    </section>
  );
}
