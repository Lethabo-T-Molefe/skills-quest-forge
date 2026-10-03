import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field, Notice, SelectMenu, SignalButton, TextInput } from "@/components";
import { useAnalysisDatasets } from "@/features/analysis";
import { notifyError } from "@/lib/notify";
import { createMonitor, refreshMonitors } from "../api/monitors";
import type { Cadence, RuleKind } from "../types";

const ANY = "__any__";

const ruleKinds: { value: RuleKind; label: string; unit: string; hint: string }[] = [
  {
    value: "change",
    label: "It changes by more than a percentage in a month",
    unit: "Per cent",
    hint: "For example 15 for a rise or fall of more than 15%.",
  },
  {
    value: "above",
    label: "It rises above a value",
    unit: "Value",
    hint: "In the metric's own unit. For a rate, 0.7 means 70%.",
  },
  {
    value: "below",
    label: "It drops below a value",
    unit: "Value",
    hint: "In the metric's own unit. For a rate, 0.7 means 70%.",
  },
  {
    value: "band",
    label: "It leaves its usual range",
    unit: "Standard deviations",
    hint: "How far from the last six months' average counts as unusual. 2 is a common choice.",
  },
];

const cadences: { value: Cadence; label: string }[] = [
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
];

/** Watch a metric: which data, which measure, for whom, and what counts as worth an alert. */
export function MonitorForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  // A monitor compares months, so only datasets with a month column can be watched.
  const datasets = useAnalysisDatasets().filter((dataset) => dataset.hasTime);
  const [name, setName] = useState("");
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];
  const [measure, setMeasure] = useState("");
  const [dimension, setDimension] = useState(ANY);
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<RuleKind>("change");
  const [threshold, setThreshold] = useState("15");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [notifySlack, setNotifySlack] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);

  const chosenMeasure =
    dataset?.measures.find((item) => item.id === measure)?.id ?? dataset?.defaultMeasure ?? "";
  const chosenDimension = dataset?.dimensions.find((item) => item.id === dimension);
  const chosenValue = chosenDimension?.values.includes(value)
    ? value
    : (chosenDimension?.values[0] ?? "");
  const rule = ruleKinds.find((item) => item.value === kind)!;

  const create = useMutation({
    mutationFn: () => {
      if (!dataset) throw new Error("Choose a dataset.");
      return createMonitor({
        name: name.trim(),
        datasetId: dataset.id,
        measure: chosenMeasure,
        filters: chosenDimension && chosenValue ? { [chosenDimension.id]: chosenValue } : {},
        rule: { kind, threshold: Number(threshold), window: 6 },
        cadence,
        notifySlack,
        notifyEmail,
      });
    },
    onSuccess: async (monitor) => {
      await refreshMonitors(queryClient);
      toast.success(`Now watching ${monitor.metric}`, { description: monitor.threshold });
      onCreated();
    },
    onError: notifyError("The monitor could not be created."),
  });

  if (!dataset) {
    return (
      <Notice title="Nothing can be watched yet">
        A monitor compares one month with the next, so it needs an approved dataset that has a month
        column.
      </Notice>
    );
  }

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
          placeholder="Gauteng enrolments"
          maxLength={200}
          required
        />
      </Field>
      <SelectMenu
        label="Dataset"
        value={dataset.id}
        onValueChange={setDatasetId}
        options={datasets.map((item) => ({ value: item.id, label: item.name }))}
      />
      <SelectMenu
        label="Metric"
        value={chosenMeasure}
        onValueChange={setMeasure}
        options={dataset.measures.map((item) => ({
          value: item.id,
          label: item.governed ? `${item.label} · shared metric` : item.label,
        }))}
      />
      {dataset.dimensions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectMenu
            label="Only for"
            value={chosenDimension?.id ?? ANY}
            onValueChange={setDimension}
            options={[
              { value: ANY, label: "Everything" },
              ...dataset.dimensions.map((item) => ({
                value: item.id,
                label: `One ${item.label.toLowerCase()}`,
              })),
            ]}
          />
          {chosenDimension ? (
            <SelectMenu
              label={chosenDimension.label}
              value={chosenValue}
              onValueChange={setValue}
              options={chosenDimension.values.map((item) => ({ value: item, label: item }))}
            />
          ) : null}
        </div>
      ) : null}
      <SelectMenu
        label="Alert when"
        value={kind}
        onValueChange={(next) => {
          setKind(next as RuleKind);
          setThreshold(next === "change" ? "15" : next === "band" ? "2" : "");
        }}
        options={ruleKinds.map((item) => ({ value: item.value, label: item.label }))}
      />
      <Field label={rule.unit} hint={rule.hint}>
        <TextInput
          type="number"
          inputMode="decimal"
          step="any"
          min={kind === "change" || kind === "band" ? 0 : undefined}
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          required
        />
      </Field>
      <SelectMenu
        label="Check"
        value={cadence}
        onValueChange={(next) => setCadence(next as Cadence)}
        options={cadences}
      />
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--signal)]"
          checked={notifyEmail}
          onChange={(event) => setNotifyEmail(event.target.checked)}
        />
        <span>
          Email me when it trips
          <span className="block text-xs text-muted-foreground">
            The alert and what drove it. It also appears under the bell at the top of the page.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--signal)]"
          checked={notifySlack}
          onChange={(event) => setNotifySlack(event.target.checked)}
        />
        <span>
          Also send the alert to Slack
          <span className="block text-xs text-muted-foreground">
            Sent to the organisation&apos;s alerts channel, if one is connected.
          </span>
        </span>
      </label>
      <SignalButton type="submit" disabled={create.isPending}>
        {create.isPending ? "Starting…" : "Start watching"}
      </SignalButton>
    </form>
  );
}
