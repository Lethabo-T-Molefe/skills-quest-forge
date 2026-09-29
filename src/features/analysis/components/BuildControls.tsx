import type { ReactNode } from "react";
import { Segmented, SelectMenu, type SegmentedOption } from "@/components";
import { COURSES, MONTHS, REGIONS } from "../data/facts";
import { analysisMethods } from "../data/methods";
import { analysisDatasets, dimensionLabels, getAnalysisDataset, grainLabels, grainsFor, measures } from "../data/schemas";
import { groupDimensionsFor, measuresFor, switchDataset, switchMethod } from "../engine/config";
import type { BuildConfig, BuildMethodId } from "../types";

type Option<T extends string> = SegmentedOption<T> & { hint: string };

const methodOptions: SegmentedOption<BuildMethodId>[] = [
  { value: "summarise", label: "Summarise" },
  { value: "compare", label: "Compare" },
  { value: "trend", label: "Trend" },
  { value: "relationship", label: "Relationship" },
  { value: "explain", label: "Explain a change" },
];

const rateOptions: Option<BuildConfig["rateMethod"]>[] = [
  { value: "pooled", label: "Pooled", hint: "Total numerator ÷ total denominator, so larger groups count for more." },
  { value: "average", label: "Averaged", hint: "The plain mean of each row's rate. Every row counts the same." },
];
const aggregationOptions: Option<BuildConfig["aggregation"]>[] = [
  { value: "total", label: "Total", hint: "Everything in the period, added up." },
  { value: "monthly-mean", label: "Monthly average", hint: "The average month, so longer-running groups are not favoured." },
  { value: "monthly-median", label: "Monthly median", hint: "The middle month, which ignores one unusual month." },
];
const sortOptions: Option<BuildConfig["sort"]>[] = [
  { value: "desc", label: "High to low", hint: "Largest first." },
  { value: "asc", label: "Low to high", hint: "Smallest first." },
  { value: "name", label: "A to Z", hint: "Alphabetical." },
];
const centreOptions: Option<BuildConfig["centre"]>[] = [
  { value: "median", label: "Median", hint: "The middle value. Ignores extremes, so it suits money." },
  { value: "mean", label: "Mean", hint: "The arithmetic average. Pulled towards extreme values." },
];
const outlierOptions: Option<BuildConfig["outliers"]>[] = [
  { value: "include", label: "Keep", hint: "Every value counts. Unusual ones are still flagged." },
  { value: "exclude", label: "Leave out", hint: "Drop values beyond 1.5 × the interquartile range (Tukey fences)." },
];
const changeOptions: Option<BuildConfig["change"]>[] = [
  { value: "level", label: "Level", hint: "The value in each month." },
  { value: "mom", label: "Monthly change", hint: "The percentage change from the month before." },
  { value: "cumulative", label: "Running total", hint: "Everything so far, month by month." },
];
const smoothingOptions: Option<BuildConfig["smoothing"]>[] = [
  { value: "none", label: "None", hint: "Each month as it is." },
  { value: "ma3", label: "3-month average", hint: "Averages each month with the two before it to smooth out noise." },
];
const correlationOptions: Option<BuildConfig["correlation"]>[] = [
  { value: "pearson", label: "Pearson", hint: "Looks for a straight-line pattern. Sensitive to extreme values." },
  { value: "spearman", label: "Spearman", hint: "Compares order, not size. Catches curves and resists extremes." },
];
const changeViewOptions: Option<BuildConfig["changeView"]>[] = [
  { value: "amount", label: "Amount", hint: "Each group's change. Together they add up to the total change." },
  { value: "percent", label: "% of its own start", hint: "Each group's change relative to its own size. Surfaces small groups that moved sharply." },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-4">
      {/* The legend floats so it sits inside the border; the content clears it so grids start on their own line. */}
      <legend className="float-left mb-3 w-full text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </legend>
      <div className="clear-both space-y-3">{children}</div>
    </fieldset>
  );
}

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const current = options.find((option) => option.value === value);
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Segmented size="sm" label={label} value={value} options={options} onValueChange={onChange} />
      {current ? <p className="mt-1 text-xs text-muted-foreground">{current.hint}</p> : null}
    </div>
  );
}

export function BuildControls({ config, onChange }: { config: BuildConfig; onChange: (next: BuildConfig) => void }) {
  const dataset = getAnalysisDataset(config.datasetId) ?? analysisDatasets[0]!;
  const method = analysisMethods.find((item) => item.id === config.method);
  const set = <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => onChange({ ...config, [key]: value });
  const measureOptions = measuresFor(dataset, config.method).map((id) => ({ value: id, label: measures[id].label }));
  const measure = measures[config.measure];
  const usesRates =
    measure.kind === "ratio" || (config.method === "relationship" && measures[config.measureY].kind === "ratio");
  const hasCourse = dataset.dimensions.includes("course");
  const monthOptions = (disable: (id: string) => boolean) =>
    MONTHS.map((month) => ({ value: month.id, label: month.label, disabled: disable(month.id) }));

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Method</p>
        <Segmented
          size="sm"
          label="Analysis method"
          value={config.method}
          options={methodOptions}
          onValueChange={(next) => onChange(switchMethod(config, next))}
        />
        {method ? <p className="mt-1.5 text-sm">{method.question}</p> : null}
      </div>

      <Section title="Data">
        <SelectMenu
          size="sm"
          label="Dataset"
          value={config.datasetId}
          onValueChange={(next) => onChange(switchDataset(config, next))}
          options={analysisDatasets.map((item) => ({ value: item.id, label: item.name }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectMenu
            size="sm"
            label="Region"
            value={config.region}
            onValueChange={(next) => set("region", next)}
            options={[{ value: "all", label: "All regions" }, ...REGIONS.map((name) => ({ value: name, label: name }))]}
          />
          {hasCourse ? (
            <SelectMenu
              size="sm"
              label="Course"
              value={config.course}
              onValueChange={(next) => set("course", next)}
              options={[{ value: "all", label: "All courses" }, ...COURSES.map((name) => ({ value: name, label: name }))]}
            />
          ) : null}
        </div>
        {config.method !== "explain" ? (
          <div className="grid grid-cols-2 gap-3">
            <SelectMenu
              size="sm"
              label="From"
              value={config.from}
              onValueChange={(next) => set("from", next)}
              options={monthOptions((id) => id > config.to)}
            />
            <SelectMenu
              size="sm"
              label="To"
              value={config.to}
              onValueChange={(next) => set("to", next)}
              options={monthOptions((id) => id < config.from)}
            />
          </div>
        ) : null}
      </Section>

      <Section title="What to measure">
        {config.method === "relationship" ? (
          <div className="grid grid-cols-2 gap-3">
            <SelectMenu
              size="sm"
              label="Across (x)"
              value={config.measure}
              onValueChange={(next) => set("measure", next as BuildConfig["measure"])}
              options={measureOptions.map((option) => ({ ...option, disabled: option.value === config.measureY }))}
            />
            <SelectMenu
              size="sm"
              label="Up (y)"
              value={config.measureY}
              onValueChange={(next) => set("measureY", next as BuildConfig["measureY"])}
              options={measureOptions.map((option) => ({ ...option, disabled: option.value === config.measure }))}
            />
          </div>
        ) : (
          <SelectMenu
            size="sm"
            label="Measure"
            value={config.measure}
            onValueChange={(next) => set("measure", next as BuildConfig["measure"])}
            options={measureOptions}
          />
        )}

        {config.method === "compare" || config.method === "explain" ? (
          <SelectMenu
            size="sm"
            label={config.method === "explain" ? "Break the change down by" : "Group by"}
            value={config.dimension}
            onValueChange={(next) => set("dimension", next as BuildConfig["dimension"])}
            options={groupDimensionsFor(dataset).map((dim) => ({ value: dim, label: dimensionLabels[dim] }))}
          />
        ) : null}

        {config.method === "summarise" || config.method === "relationship" ? (
          <SelectMenu
            size="sm"
            label={config.method === "relationship" ? "One dot for" : "One value for"}
            value={config.grain}
            onValueChange={(next) => set("grain", next as BuildConfig["grain"])}
            options={grainsFor(dataset).map((grain) => ({ value: grain, label: grainLabels[grain] }))}
          />
        ) : null}

        {config.method === "trend" ? (
          <SelectMenu
            size="sm"
            label="Lines"
            value={config.split}
            onValueChange={(next) => set("split", next as BuildConfig["split"])}
            options={[
              { value: "none", label: "One line for everything" },
              { value: "region", label: "One line per region" },
              ...(hasCourse ? [{ value: "course", label: "One line per course" }] : []),
            ]}
          />
        ) : null}

        {config.method === "explain" ? (
          <div className="grid grid-cols-2 gap-3">
            <SelectMenu
              size="sm"
              label="From month"
              value={config.periodA}
              onValueChange={(next) => set("periodA", next)}
              options={monthOptions((id) => id === config.periodB)}
            />
            <SelectMenu
              size="sm"
              label="To month"
              value={config.periodB}
              onValueChange={(next) => set("periodB", next)}
              options={monthOptions((id) => id === config.periodA)}
            />
          </div>
        ) : null}
        {config.method === "explain" ? (
          <p className="text-xs text-muted-foreground">Rates are not listed: a change is split into parts only for totals.</p>
        ) : null}
      </Section>

      <Section title="How it is calculated">
        {config.method === "summarise" ? (
          <>
            <OptionRow label="Typical value" value={config.centre} options={centreOptions} onChange={(next) => set("centre", next)} />
            <OptionRow label="Unusual values" value={config.outliers} options={outlierOptions} onChange={(next) => set("outliers", next)} />
          </>
        ) : null}
        {config.method === "compare" ? (
          <>
            {measure.kind === "additive" ? (
              <OptionRow
                label="Combine months as"
                value={config.aggregation}
                options={aggregationOptions}
                onChange={(next) => set("aggregation", next)}
              />
            ) : null}
            <OptionRow
              label="Show as"
              value={config.display}
              options={[
                { value: "value", label: "Value", hint: "The measure itself." },
                {
                  value: "share",
                  label: "Share of total",
                  hint: "Each group's part of the whole.",
                  disabled: measure.kind === "ratio",
                },
                { value: "index", label: "Index", hint: "100 is the average group. 120 means 20% above it." },
              ]}
              onChange={(next) => set("display", next)}
            />
            <OptionRow label="Order" value={config.sort} options={sortOptions} onChange={(next) => set("sort", next)} />
          </>
        ) : null}
        {config.method === "trend" ? (
          <>
            <OptionRow label="Show" value={config.change} options={changeOptions} onChange={(next) => set("change", next)} />
            <OptionRow label="Smoothing" value={config.smoothing} options={smoothingOptions} onChange={(next) => set("smoothing", next)} />
          </>
        ) : null}
        {config.method === "relationship" ? (
          <>
            <OptionRow
              label="Correlation"
              value={config.correlation}
              options={correlationOptions}
              onChange={(next) => set("correlation", next)}
            />
            <OptionRow label="Unusual values" value={config.outliers} options={outlierOptions} onChange={(next) => set("outliers", next)} />
          </>
        ) : null}
        {config.method === "explain" ? (
          <OptionRow
            label="Show each group's change as"
            value={config.changeView}
            options={changeViewOptions}
            onChange={(next) => set("changeView", next)}
          />
        ) : null}
        {usesRates && config.method !== "explain" ? (
          <OptionRow label="Rates" value={config.rateMethod} options={rateOptions} onChange={(next) => set("rateMethod", next)} />
        ) : null}
      </Section>
    </div>
  );
}
