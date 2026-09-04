import { useMemo, useState } from "react";
import {
  FlaskConical, Plus, Trash2, ChevronLeft, Loader2, Package, RefreshCw, CheckCircle2,
} from "lucide-react";
import { Panel, Badge } from "./panel";
import { LineTrend } from "./charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  useMlflowStatus, useExperiments, useCreateExperiment, useDeleteExperiment,
  useRuns, useRun, useDeleteRun, useModels, useTransitionModelStage, useDeleteModel, useQuickTrain,
} from "@/lib/queries/mlflow";
import { useDatasetsForAnalysis } from "@/lib/queries/statistics";
import { ALGORITHMS, type MlflowRunSummary } from "@/lib/api/mlflow";

// Every experiment/run/model here is real — tracked by a genuine, self-hosted
// MLflow server (backend/infrastructure/external/mlflow_process.py). MLflow's
// own web UI is never shown; this is the CHIETA design system end to end
// (Panel/Badge/sw-card, Roboto display font, the brand's purple/gold
// palette) — same principle as the Notebooks page (real Jupyter kernels,
// system-styled cell UI, JupyterLab's own UI never shown).

function statusTone(status: string): "success" | "danger" | "info" | "muted" {
  if (status === "FINISHED") return "success";
  if (status === "FAILED" || status === "KILLED") return "danger";
  if (status === "RUNNING") return "info";
  return "muted";
}

function fmtTime(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function fmtMetric(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(4);
}

function ExperimentsSidebar({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const { data: experiments = [], isLoading } = useExperiments(true);
  const createExperiment = useCreateExperiment();
  const deleteExperiment = useDeleteExperiment();
  const [newName, setNewName] = useState("");

  const visible = experiments.filter((e) => e.name !== "Default");

  return (
    <Panel title="Experiments" subtitle={`${visible.length} total`}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New experiment name"
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            disabled={!newName.trim() || createExperiment.isPending}
            onClick={() => { createExperiment.mutate(newName.trim()); setNewName(""); }}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-6 flex justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="text-xs text-muted-foreground py-4 text-center">
            No experiments yet — create one, or use "Train a Model" to make one automatically.
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {visible.map((e) => (
              <li key={e.experiment_id} className="flex items-center gap-1 group">
                <button
                  onClick={() => onSelect(e.experiment_id)}
                  className={`flex-1 text-left px-3 py-1.5 rounded-md text-sm truncate transition ${
                    selectedId === e.experiment_id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted"
                  }`}
                >
                  {e.name}
                </button>
                <button
                  onClick={() => deleteExperiment.mutate(e.experiment_id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition"
                  title="Delete experiment"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

function RunsTable({ experimentId, onOpenRun }: { experimentId: string; onOpenRun: (runId: string) => void }) {
  const { data: runs = [], isLoading } = useRuns(experimentId);
  const deleteRun = useDeleteRun();

  const metricKeys = useMemo(() => {
    const keys = new Set<string>();
    runs.forEach((r) => Object.keys(r.metrics).forEach((k) => keys.add(k)));
    return [...keys].slice(0, 3);
  }, [runs]);

  if (isLoading) {
    return <div className="py-10 flex justify-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  if (runs.length === 0) {
    return (
      <Panel title="Runs" subtitle="No runs in this experiment yet">
        <div className="text-sm text-muted-foreground py-6 text-center">
          Use "Train a Model" above to create a real run here.
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Runs" subtitle={`${runs.length} run${runs.length === 1 ? "" : "s"}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground uppercase tracking-wide">
              <th className="p-2 font-semibold">Run</th>
              <th className="p-2 font-semibold">Status</th>
              <th className="p-2 font-semibold">Started</th>
              {metricKeys.map((k) => <th key={k} className="p-2 font-semibold text-right">{k}</th>)}
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {runs.map((r: MlflowRunSummary) => (
              <tr key={r.run_id} className="border-b border-border/60 hover:bg-muted/40">
                <td className="p-2">
                  <button onClick={() => onOpenRun(r.run_id)} className="font-medium hover:underline text-left">
                    {r.run_name}
                  </button>
                </td>
                <td className="p-2"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                <td className="p-2 text-muted-foreground">{fmtTime(r.start_time)}</td>
                {metricKeys.map((k) => (
                  <td key={k} className="p-2 text-right font-mono">
                    {r.metrics[k] !== undefined ? fmtMetric(r.metrics[k]) : "—"}
                  </td>
                ))}
                <td className="p-2 text-right">
                  <button
                    onClick={() => deleteRun.mutate(r.run_id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function RunDetail({ runId, onBack }: { runId: string; onBack: () => void }) {
  const { data: run, isLoading } = useRun(runId);

  if (isLoading || !run) {
    return <div className="py-10 flex justify-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  const metricEntries = Object.entries(run.metrics);
  const firstChartable = Object.entries(run.metric_history).find(([, points]) => points.length > 1);

  return (
    <Panel
      title={run.run_name}
      subtitle={`Run ${run.run_id.slice(0, 8)}`}
      action={<Badge tone={statusTone(run.status)}>{run.status}</Badge>}
    >
      <div className="flex flex-col gap-4">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
          <ChevronLeft className="size-3.5" /> Back to runs
        </button>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {metricEntries.map(([k, v]) => (
            <div key={k} className="sw-card bg-card p-3 flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{k}</div>
              <div className="font-display text-xl font-extrabold">{fmtMetric(v)}</div>
            </div>
          ))}
        </div>

        {firstChartable && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {firstChartable[0]} over steps
            </div>
            <LineTrend
              data={firstChartable[1].map((p) => ({ month: String(p.step), [firstChartable[0]]: p.value }))}
              keys={[firstChartable[0]]}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Params</div>
            <div className="flex flex-col gap-1 text-xs">
              {Object.entries(run.params).length === 0 && <div className="text-muted-foreground">None logged</div>}
              {Object.entries(run.params).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-border/50 py-1">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono truncate max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Tags</div>
            <div className="flex flex-col gap-1 text-xs">
              {Object.entries(run.tags).filter(([k]) => !k.startsWith("mlflow.")).length === 0 && (
                <div className="text-muted-foreground">None</div>
              )}
              {Object.entries(run.tags).filter(([k]) => !k.startsWith("mlflow.")).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-border/50 py-1">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono truncate max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Artifacts</div>
          {run.artifacts.length === 0 ? (
            <div className="text-xs text-muted-foreground">None logged</div>
          ) : (
            <ul className="flex flex-col gap-1 text-xs font-mono">
              {run.artifacts.map((a) => (
                <li key={a.path} className="flex justify-between border-b border-border/50 py-1">
                  <span>{a.path}</span>
                  <span className="text-muted-foreground">{a.file_size ? `${a.file_size} B` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

function ModelRegistry() {
  const { data: models = [], isLoading } = useModels(true);
  const transition = useTransitionModelStage();
  const deleteModel = useDeleteModel();
  const stages = ["None", "Staging", "Production", "Archived"];

  if (isLoading) {
    return <div className="py-10 flex justify-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  if (models.length === 0) {
    return (
      <Panel title="Model Registry" subtitle="No registered models yet">
        <div className="text-sm text-muted-foreground py-6 text-center">
          Check "Register as a model" when running "Train a Model" to see versions here.
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {models.map((m) => (
        <Panel
          key={m.name}
          title={m.name}
          subtitle={`${m.versions.length} version${m.versions.length === 1 ? "" : "s"}`}
          action={
            <button
              onClick={() => deleteModel.mutate(m.name)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-3.5" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground uppercase tracking-wide">
                  <th className="p-2 font-semibold">Version</th>
                  <th className="p-2 font-semibold">Run</th>
                  <th className="p-2 font-semibold">Status</th>
                  <th className="p-2 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody>
                {m.versions.map((v) => (
                  <tr key={v.version} className="border-b border-border/60">
                    <td className="p-2 font-semibold">v{v.version}</td>
                    <td className="p-2 font-mono text-muted-foreground">{v.run_id.slice(0, 8)}</td>
                    <td className="p-2"><Badge tone="muted">{v.status}</Badge></td>
                    <td className="p-2">
                      <Select
                        value={v.stage}
                        onValueChange={(stage) => transition.mutate({ name: m.name, version: v.version, stage })}
                      >
                        <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function TrainModelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: datasets = [] } = useDatasetsForAnalysis();
  const quickTrain = useQuickTrain();

  const [datasetId, setDatasetId] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [algorithm, setAlgorithm] = useState<string>(ALGORITHMS[0].value);
  const [experimentName, setExperimentName] = useState("Quick Train");
  const [registerModel, setRegisterModel] = useState(false);

  const dataset = datasets.find((d) => String(d.id) === datasetId);
  const columns = dataset?.columns ?? [];

  function toggleFeature(name: string) {
    setFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  function submit() {
    if (!dataset || !target || features.size === 0) return;
    quickTrain.mutate({
      dataset_id: dataset.id,
      target_column: target,
      feature_columns: [...features],
      algorithm,
      experiment_name: experimentName || "Quick Train",
      register_model: registerModel,
    });
  }

  function handleClose() {
    quickTrain.reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Train a Model</DialogTitle>
          <DialogDescription>
            Trains a real scikit-learn model against one of your datasets and logs it to MLflow —
            no code required.
          </DialogDescription>
        </DialogHeader>

        {quickTrain.isSuccess ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-success font-semibold text-sm">
              <CheckCircle2 className="size-4" /> Run logged successfully
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(quickTrain.data.metrics).map(([k, v]) => (
                <div key={k} className="sw-card bg-card p-2 flex flex-col">
                  <span className="text-muted-foreground uppercase text-[10px]">{k}</span>
                  <span className="font-display font-bold">{fmtMetric(v)}</span>
                </div>
              ))}
            </div>
            {quickTrain.data.registered_version && (
              <div className="text-xs text-muted-foreground">
                Registered as model version v{quickTrain.data.registered_version.version}.
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Dataset</Label>
              <Select value={datasetId} onValueChange={(v) => { setDatasetId(v); setTarget(""); setFeatures(new Set()); }}>
                <SelectTrigger><SelectValue placeholder="Choose an uploaded dataset" /></SelectTrigger>
                <SelectContent>
                  {datasets.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {dataset && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label>Target column (what to predict)</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger><SelectValue placeholder="Choose a column" /></SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Feature columns</Label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-border rounded-md p-2">
                    {columns.filter((c) => c.name !== target).map((c) => (
                      <label key={c.name} className="flex items-center gap-2 text-xs">
                        <Checkbox checked={features.has(c.name)} onCheckedChange={() => toggleFeature(c.name)} />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Algorithm</Label>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALGORITHMS.map((a) => (
                        <SelectItem key={a.value} value={a.value}>{a.label} ({a.task})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Experiment name</Label>
                  <Input value={experimentName} onChange={(e) => setExperimentName(e.target.value)} />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id="mlflow-register-model"
                    checked={registerModel}
                    onCheckedChange={(v) => setRegisterModel(v === true)}
                  />
                  <Label htmlFor="mlflow-register-model">Register as a model after training</Label>
                </div>

                {quickTrain.isError && (
                  <div className="text-sm text-danger">{(quickTrain.error as Error).message}</div>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                onClick={submit}
                disabled={!dataset || !target || features.size === 0 || quickTrain.isPending}
              >
                {quickTrain.isPending ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
                Train
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MlflowConsole() {
  const { data: status, isLoading: statusLoading } = useMlflowStatus();
  const [view, setView] = useState<"experiments" | "models">("experiments");
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [trainOpen, setTrainOpen] = useState(false);

  if (statusLoading) {
    return <div className="py-12 flex justify-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  if (!status?.available) {
    return (
      <Panel title="MLflow" subtitle="Self-hosted tracking server">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <RefreshCw className="size-6 text-muted-foreground animate-spin" />
          <div className="text-sm text-muted-foreground max-w-md">
            The self-hosted MLflow server is starting up (or its isolated venv isn't set up yet —
            see the backend README's "MLflow" section). This page will pick it up automatically.
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-full border border-border bg-muted/40 w-fit">
          <button
            onClick={() => setView("experiments")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${view === "experiments" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Experiments
          </button>
          <button
            onClick={() => setView("models")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${view === "models" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Package className="size-3.5" /> Model Registry
          </button>
        </div>
        <Button onClick={() => setTrainOpen(true)}>
          <FlaskConical className="size-4" /> Train a Model
        </Button>
      </div>

      {view === "experiments" ? (
        <div className="grid md:grid-cols-[280px_1fr] gap-4 items-start">
          <ExperimentsSidebar
            selectedId={selectedExperimentId}
            onSelect={(id) => { setSelectedExperimentId(id); setSelectedRunId(null); }}
          />
          {selectedRunId ? (
            <RunDetail runId={selectedRunId} onBack={() => setSelectedRunId(null)} />
          ) : selectedExperimentId ? (
            <RunsTable experimentId={selectedExperimentId} onOpenRun={setSelectedRunId} />
          ) : (
            <Panel title="Runs" subtitle="Select an experiment">
              <div className="text-sm text-muted-foreground py-10 text-center">
                Choose an experiment on the left, or train a model to create one.
              </div>
            </Panel>
          )}
        </div>
      ) : (
        <ModelRegistry />
      )}

      <TrainModelDialog open={trainOpen} onClose={() => setTrainOpen(false)} />
    </div>
  );
}
