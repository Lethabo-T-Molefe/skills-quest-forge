import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field, Segmented, SelectMenu, SignalButton, TextArea, TextInput } from "@/components";
import type { MeasureUnit } from "@/features/analysis";
import { useDatasets } from "@/features/datasets";
import { notifyError } from "@/lib/notify";
import { createMetric, refreshMetrics } from "../api/metrics";
import type { MetricKind } from "../types";

const kinds: { value: MetricKind; label: string; hint: string }[] = [
  { value: "additive", label: "Total", hint: "Adds up one column, such as revenue" },
  { value: "ratio", label: "Ratio", hint: "One total divided by another, such as a rate" },
  { value: "distinct", label: "Distinct", hint: "Counts the different values in a column" },
  { value: "count", label: "Row count", hint: "Counts rows" },
];

const units: { value: MeasureUnit; label: string }[] = [
  { value: "count", label: "A count (48 213)" },
  { value: "money", label: "Money (R1 214)" },
  { value: "rate", label: "A rate (66.3%)" },
  { value: "decimal", label: "A decimal (3.07)" },
];

function previewExpression(
  kind: MetricKind,
  column: string,
  numerator: string,
  denominator: string,
) {
  switch (kind) {
    case "additive":
      return `SUM(${column || "column"})`;
    case "distinct":
      return `COUNT(DISTINCT ${column || "column"})`;
    case "count":
      return "COUNT(*)";
    default:
      return `SUM(${numerator || "numerator"}) / NULLIF(SUM(${denominator || "denominator"}), 0)`;
  }
}

/** Define a metric once. It is saved as a draft and used everywhere once a steward publishes it. */
export function DefineMetricForm({ onSaved }: { onSaved: () => void }) {
  const queryClient = useQueryClient();
  // Column names come from approved data, so a metric is written against columns that exist.
  const columns = [
    ...new Set(
      useDatasets()
        .filter((dataset) => dataset.queryable)
        .flatMap((dataset) => dataset.columns.map((column) => column.name)),
    ),
  ].sort();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<MetricKind>("additive");
  const [unit, setUnit] = useState<MeasureUnit>("count");
  const [column, setColumn] = useState("");
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [synonyms, setSynonyms] = useState("");

  const save = useMutation({
    mutationFn: () =>
      createMetric({
        name: name.trim(),
        description: description.trim(),
        kind,
        unit,
        ...(kind === "additive" || kind === "distinct" ? { column: column.trim() } : {}),
        ...(kind === "ratio"
          ? { numerator: numerator.trim(), denominator: denominator.trim() }
          : {}),
        synonyms: synonyms
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    onSuccess: async (metric) => {
      await refreshMetrics(queryClient);
      toast.success(`${metric.name} saved as a draft`, {
        description: "A steward publishes it before the assistant and dashboards can use it.",
      });
      onSaved();
    },
    onError: notifyError("The metric could not be saved."),
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <Field label="Name">
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sessions per learner"
          maxLength={120}
          required
        />
      </Field>
      <Field label="What it means, in plain words">
        <TextArea
          rows={3}
          className="font-sans"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Sessions logged divided by active learners in the same period."
          maxLength={2000}
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium">How it is calculated</p>
        <Segmented
          label="How it is calculated"
          value={kind}
          onValueChange={(next) => {
            setKind(next);
            if (next === "ratio" && unit === "count") setUnit("rate");
          }}
          options={kinds}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {kinds.find((item) => item.value === kind)?.hint}.
        </p>
      </div>

      <datalist id="metric-columns">
        {columns.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      {kind === "additive" || kind === "distinct" ? (
        <Field label="Column" hint="A column of an approved dataset.">
          <TextInput
            className="font-mono"
            list="metric-columns"
            value={column}
            onChange={(event) => setColumn(event.target.value)}
            placeholder="sessions"
            spellCheck={false}
            required
          />
        </Field>
      ) : null}
      {kind === "ratio" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Numerator column">
            <TextInput
              className="font-mono"
              list="metric-columns"
              value={numerator}
              onChange={(event) => setNumerator(event.target.value)}
              placeholder="sessions"
              spellCheck={false}
              required
            />
          </Field>
          <Field label="Denominator column">
            <TextInput
              className="font-mono"
              list="metric-columns"
              value={denominator}
              onChange={(event) => setDenominator(event.target.value)}
              placeholder="active_learners"
              spellCheck={false}
              required
            />
          </Field>
        </div>
      ) : null}

      <SelectMenu
        label="Shown as"
        value={unit}
        onValueChange={(value) => setUnit(value as MeasureUnit)}
        options={units}
      />

      <Field
        label="Other names people use (optional)"
        hint="Separated by commas. The assistant matches questions against these."
      >
        <TextInput
          value={synonyms}
          onChange={(event) => setSynonyms(event.target.value)}
          placeholder="engagement, sessions each"
        />
      </Field>

      <div className="bg-surface-inverse px-3 py-2 font-mono text-[12px] text-background">
        {previewExpression(kind, column.trim(), numerator.trim(), denominator.trim())}
      </div>

      <SignalButton type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save as a draft"}
      </SignalButton>
    </form>
  );
}
