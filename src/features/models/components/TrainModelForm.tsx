import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Brain, ListChecks } from "lucide-react";
import { Field, Notice, QuietButton, SelectMenu, SignalButton, TextInput } from "@/components";
import { useAnalysisDatasets } from "@/features/analysis";
import { errorMessage } from "@/lib/api";
import { previewTraining, refreshModels, trainModel, trainOptionsQuery } from "../api/models";
import type { TrainRequest } from "../types";
import { FeaturePlanTable } from "./ModelSections";

/** Radix select items cannot have an empty value. */
const ALL = "__all__";

const policies = [
  { value: "max_f1", label: "Balance precision and recall (best F1)" },
  { value: "recall_at", label: "Catch a set share of the outcome (recall target)" },
  { value: "top_pct", label: "Flag a set share of records (capacity)" },
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Train a model for a yes/no outcome on any approved dataset. Personal columns are locked out; protected
 * attributes are audited for fairness and never used to score. The result is a draft that someone else
 * reviews before it can be used.
 */
export function TrainModelForm({ onTrained }: { onTrained: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const datasets = useAnalysisDatasets();
  const [datasetId, setDatasetId] = useState("");
  const options = useQuery(trainOptionsQuery(datasetId));
  const [column, setColumn] = useState("");
  const [positive, setPositive] = useState("");
  const [unlabelled, setUnlabelled] = useState<string[]>([]);
  const [protectedColumns, setProtected] = useState<string[]>([]);
  const [label, setLabel] = useState("");
  const [entity, setEntity] = useState("record");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0");
  const [trainUntil, setTrainUntil] = useState("");
  const [algorithms, setAlgorithms] = useState<string[]>(["logistic", "hist_gb"]);
  const [policy, setPolicy] = useState("max_f1");
  const [target, setTarget] = useState("0.7");

  useEffect(() => {
    if (!options.data) return;
    setProtected(options.data.protected);
    setColumn("");
    setPositive("");
    setUnlabelled([]);
  }, [options.data]);

  const outcome = options.data?.outcomes.find((item) => item.name === column);
  const otherValues = (outcome?.values ?? []).filter((value) => value !== positive);
  const body: TrainRequest = useMemo(
    () => ({
      datasetId,
      name,
      version,
      outcome: { column, positive, unlabelled, label, entity },
      protected: protectedColumns,
      exclude: [],
      ...(trainUntil ? { trainUntil } : {}),
      algorithms,
      threshold: policy === "max_f1" ? { policy } : { policy, target: Number(target) },
    }),
    [
      datasetId,
      name,
      version,
      column,
      positive,
      unlabelled,
      label,
      entity,
      protectedColumns,
      trainUntil,
      algorithms,
      policy,
      target,
    ],
  );
  const ready = Boolean(
    datasetId && column && positive && name && version && algorithms.length > 0,
  );

  const preview = useMutation({ mutationFn: () => previewTraining(body) });
  const train = useMutation({
    mutationFn: () => trainModel(body),
    onSuccess: async (drafts) => {
      await refreshModels(queryClient);
      toast.success(`Trained ${drafts.map((d) => d.label).join(" and ")}`, {
        description: "Saved as a draft. Someone else reviews it before it can be used.",
      });
      onTrained();
      const first = drafts[0];
      if (first) void navigate({ to: "/models/$modelId", params: { modelId: first.id } });
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        train.mutate();
      }}
    >
      <Field label="Dataset">
        <SelectMenu
          value={datasetId}
          onValueChange={setDatasetId}
          options={datasets.map((d) => ({ value: d.id, label: d.name }))}
          placeholder="Choose an approved dataset"
        />
      </Field>

      {options.isLoading ? (
        <p className="text-sm text-muted-foreground">Reading the dataset…</p>
      ) : null}
      {options.error ? (
        <Notice tone="signal" title="The dataset cannot be used">
          {errorMessage(options.error)}
        </Notice>
      ) : null}

      {options.data ? (
        <>
          <Field
            label="Outcome column"
            hint="A column with a handful of values, one of which is the outcome."
          >
            <SelectMenu
              value={column}
              onValueChange={(next) => {
                setColumn(next);
                setPositive("");
                setUnlabelled([]);
              }}
              options={options.data.outcomes.map((o) => ({ value: o.name, label: o.label }))}
              placeholder="Choose a column"
            />
          </Field>
          {outcome ? (
            <Field label="The value that counts as the outcome happening">
              <SelectMenu
                value={positive}
                onValueChange={setPositive}
                options={outcome.values.map((v) => ({ value: v, label: v }))}
                placeholder="Choose a value"
              />
            </Field>
          ) : null}
          {positive && otherValues.length > 0 ? (
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Values that mean “not known yet”</legend>
              <p className="text-xs text-muted-foreground">
                Records with these values are scored, not learned from (for example, still in
                progress).
              </p>
              {otherValues.map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={unlabelled.includes(value)}
                    onChange={() => setUnlabelled(toggle(unlabelled, value))}
                  />
                  {value}
                </label>
              ))}
            </fieldset>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="One record is a…" hint="For example: learner, customer.">
              <TextInput value={entity} onChange={(event) => setEntity(event.target.value)} />
            </Field>
            <Field label="The outcome reads as…" hint="For example: drops out, churns.">
              <TextInput value={label} onChange={(event) => setLabel(event.target.value)} />
            </Field>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Protected attributes to audit</legend>
            <p className="text-xs text-muted-foreground">
              Checked for fairness after training and never used to score. Suggested from the column
              names.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {options.data.columns
                .filter((c) => !c.personal && c.distinct <= 60 && c.name !== column)
                .map((c) => (
                  <label key={c.name} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={protectedColumns.includes(c.name)}
                      onChange={() => setProtected(toggle(protectedColumns, c.name))}
                    />
                    {c.name}
                  </label>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Personal columns (
              {options.data.columns
                .filter((c) => c.personal)
                .map((c) => c.name)
                .join(", ") || "none"}
              ) are locked out.
            </p>
          </fieldset>
          {options.data.months.length > 0 ? (
            <Field
              label="Learn only from records up to"
              hint="Recent records may not have reached their outcome yet; leaving them out avoids a biased model."
            >
              <SelectMenu
                value={trainUntil || ALL}
                onValueChange={(next) => setTrainUntil(next === ALL ? "" : next)}
                options={[
                  { value: ALL, label: "All records with a known outcome" },
                  ...options.data.months.map((m) => ({ value: m, label: m })),
                ]}
              />
            </Field>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Model name" hint="Lower-case letters, digits and hyphens.">
              <TextInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="learner-dropout-risk"
              />
            </Field>
            <Field label="Version">
              <TextInput value={version} onChange={(event) => setVersion(event.target.value)} />
            </Field>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Algorithms</legend>
            {options.data.algorithms.map((algorithm) => (
              <label key={algorithm.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={algorithms.includes(algorithm.id)}
                  onChange={() => setAlgorithms(toggle(algorithms, algorithm.id))}
                />
                {algorithm.label}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Field label="Decision threshold">
              <SelectMenu value={policy} onValueChange={setPolicy} options={policies} />
            </Field>
            {policy !== "max_f1" ? (
              <Field label="Target share" hint="Between 0 and 1.">
                <TextInput
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.95"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                />
              </Field>
            ) : null}
          </div>

          {preview.data ? (
            <section className="border-t border-border pt-4" aria-label="Column plan">
              <FeaturePlanTable plan={preview.data.plan} />
            </section>
          ) : null}
          {preview.error ? (
            <Notice tone="signal" title="The plan could not be made">
              {errorMessage(preview.error)}
            </Notice>
          ) : null}
          {train.error ? (
            <Notice tone="signal" title="The model could not be trained">
              {errorMessage(train.error)}
            </Notice>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <QuietButton
              type="button"
              disabled={!ready || preview.isPending}
              onClick={() => preview.mutate()}
            >
              <ListChecks className="size-4" strokeWidth={1.5} aria-hidden />
              Preview the columns
            </QuietButton>
            <SignalButton type="submit" disabled={!ready || train.isPending}>
              <Brain className="size-4" strokeWidth={1.75} aria-hidden />
              {train.isPending ? "Training and validating…" : "Train and validate"}
            </SignalButton>
          </div>
        </>
      ) : null}
    </form>
  );
}
