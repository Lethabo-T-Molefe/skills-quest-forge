import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, CircleCheck } from "lucide-react";
import { ScrollPane, SignalButton } from "@/components";
import {
  AnalyseTabs,
  MethodGuide,
  analysisDatasets,
  analysisMethods,
  analysisModes,
  getAnalysisDataset,
  getMethod,
  type AnalysisMode,
  type MethodId,
} from "@/features/analysis";
import { DatasetNextAction, layerLabels, useDatasets } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";
import { cn } from "@/lib/utils";

function Step({ number, title, children, className }: { number: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel flex min-h-0 flex-col", className)} aria-labelledby={`step-${number}`}>
      <h2 id={`step-${number}`} className="font-sans flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-medium">
        <span className="num flex size-6 items-center justify-center rounded-full bg-surface-inverse text-xs text-background">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choice({
  name,
  value,
  checked,
  disabled,
  onSelect,
  title,
  detail,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  detail?: string;
  aside?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors",
        checked ? "border-transparent bg-surface-inverse text-background" : "border-border hover:bg-accent/40",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="mt-1 accent-[var(--signal)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {detail ? (
          <span className={cn("mt-0.5 block text-xs", checked ? "text-white/70" : "text-muted-foreground")}>{detail}</span>
        ) : null}
      </span>
      {aside}
    </label>
  );
}

export function AnalysePage() {
  const search = useSearch({ from: "/analyse" });
  const navigate = useNavigate({ from: "/analyse" });
  const catalogue = useDatasets();

  const analysable = catalogue.filter(
    (item) => item.status === "approved" && analysisDatasets.some((dataset) => dataset.id === item.id),
  );
  const notReady = catalogue.filter((item) => !analysable.includes(item));
  const datasetId = getAnalysisDataset(search.dataset)?.id ?? analysable[0]?.id ?? analysisDatasets[0]!.id;
  const methodId: MethodId = search.method ?? "compare";
  const method = getMethod(methodId) ?? analysisMethods[0]!;
  const [chosenMode, setChosenMode] = useState<AnalysisMode | null>(null);
  const mode: AnalysisMode = chosenMode && method.modes.includes(chosenMode) ? chosenMode : (method.modes[0] ?? "build");
  const requested = catalogue.find((item) => item.id === search.dataset);

  function choose(next: { dataset?: string; method?: MethodId }) {
    void navigate({ search: { dataset: next.dataset ?? datasetId, method: next.method ?? methodId }, replace: true });
  }

  function start() {
    const context = { dataset: datasetId, method: methodId };
    if (mode === "guided") void navigate({ to: "/analyse/predict", search: { dataset: datasetId } });
    else if (mode === "ask") void navigate({ to: "/analyse/ask", search: context });
    else if (mode === "code") void navigate({ to: "/analyse/code", search: context });
    else void navigate({ to: "/analyse/build", search: context });
  }

  const modeOrder: AnalysisMode[] = method.modes.includes("guided") ? ["guided", "ask", "build", "code"] : ["build", "ask", "code"];

  return (
    <MainLayout
      title="Analyse"
      description="Choose the data, the kind of question, and how you want to work. You can change any of these later without losing your place."
      toolbar={<AnalyseTabs context={{ dataset: datasetId, method: methodId }} />}
      fill
    >
      {requested && !analysable.includes(requested) ? (
        <p className="mb-3 text-sm text-warning">
          {requested.name} is not approved yet, so it cannot be analysed. Pick an approved dataset below.
        </p>
      ) : null}
      <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,4fr)_minmax(0,4fr)_minmax(0,5fr)]">
        <Step number={1} title="Choose the data">
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="space-y-2 p-3" role="radiogroup" aria-label="Dataset">
              {analysable.map((item) => (
                <Choice
                  key={item.id}
                  name="dataset"
                  value={item.id}
                  checked={item.id === datasetId}
                  onSelect={() => choose({ dataset: item.id })}
                  title={item.name}
                  detail={`${layerLabels[item.layer]} · ${item.description}`}
                  aside={<CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-label="Approved" />}
                />
              ))}
              {notReady.length > 0 ? (
                <div className="pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Not ready to analyse yet</p>
                  <ul className="mt-2 space-y-2">
                    {notReady.map((item) => (
                      <li key={item.id} className="border border-dashed border-border px-3 py-2.5">
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.layer === "bronze" ? "Needs cleaning, then approval." : "Waiting for a steward to approve it."}
                        </p>
                        <DatasetNextAction dataset={item} emphasis="quiet" className="mt-2 px-3 py-1 text-xs" />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </ScrollPane>
        </Step>

        <Step number={2} title="What do you want to find out?">
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="space-y-2 p-3" role="radiogroup" aria-label="Method">
              {analysisMethods.map((item) => (
                <Choice
                  key={item.id}
                  name="method"
                  value={item.id}
                  checked={item.id === methodId}
                  onSelect={() => choose({ method: item.id })}
                  title={item.name}
                  detail={item.question}
                />
              ))}
            </div>
          </ScrollPane>
        </Step>

        <Step number={3} title="How do you want to work?">
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="p-4">
              <div className="space-y-2" role="radiogroup" aria-label="Way of working">
                {modeOrder.map((item) => {
                  const available = method.modes.includes(item);
                  return (
                    <Choice
                      key={item}
                      name="mode"
                      value={item}
                      checked={available && item === mode}
                      disabled={!available}
                      onSelect={() => setChosenMode(item)}
                      title={analysisModes[item].label}
                      detail={available ? analysisModes[item].bestFor : (method.unavailable?.[item] ?? "Not available for this method.")}
                    />
                  );
                })}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">About this method</p>
                <p className="mt-1 font-display text-lg">{method.name}</p>
                <div className="mt-2">
                  <MethodGuide method={method} compact />
                </div>
                {method.id === "explain" ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Alerts already explained for you are in{" "}
                    <Link to="/monitors" className="text-signal-strong underline-offset-4 hover:underline">
                      Monitors
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </div>
          </ScrollPane>
          <div className="border-t border-border p-3">
            <SignalButton className="w-full" onClick={start}>
              {mode === "guided" ? "Start predicting" : mode === "ask" ? "Start asking" : mode === "code" ? "Open the SQL" : "Start building"}
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </SignalButton>
          </div>
        </Step>
      </div>
    </MainLayout>
  );
}
