import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, LoaderCircle, Upload, Wand2 } from "lucide-react";
import { BackLink, HelpTip, JourneySteps, QuietButton, quietButtonClass, signalButtonClass } from "@/components";
import { MainLayout } from "@/layouts/MainLayout";
import { cn } from "@/lib/utils";

const stages = [
  "The file lands in your private area",
  "Its quality is measured: completeness, types, repeats and extremes",
  "Personal information is found and masked",
  "It is ready to clean. The original is kept as it arrived",
];

/** The sample file that stands in for any upload in this prototype. */
const sampleDatasetId = "learner-enrolments";

export function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  function ingest(name: string) {
    timers.current.forEach((id) => window.clearTimeout(id));
    setFileName(name);
    setStage(0);
    timers.current = stages.map((_, index) => window.setTimeout(() => setStage(index + 1), 550 * (index + 1)));
  }

  const done = fileName !== null && stage >= stages.length;

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title="Upload a file"
      description="A file stays private to your workspace. It is measured and checked for personal information before anyone can use it."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="panel p-5" aria-label="Choose a file">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) ingest(file.name);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-14 text-center transition-colors",
              dragging ? "border-signal bg-signal-tint" : "border-line-strong hover:bg-accent/30",
            )}
          >
            <Upload className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <span className="mt-3 font-medium">Drop a CSV here, or choose a file</span>
            <span className="mt-1 text-sm text-muted-foreground">CSV, TSV or a spreadsheet export, up to 250 MB.</span>
            <input
              type="file"
              accept=".csv,.tsv,.xlsx"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) ingest(file.name);
              }}
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <QuietButton onClick={() => ingest("enrolments_q3.csv")}>Use a sample enrolment file</QuietButton>
            <HelpTip title="What if my file has personal information?">
              That is expected. Columns such as names and ID numbers are detected and masked before the data moves
              beyond the raw layer, and classification is mandatory.
            </HelpTip>
          </div>
        </section>

        <section className="panel flex flex-col p-5" aria-label="Progress" aria-live="polite">
          <h2 className="font-display text-xl">{fileName ? fileName : "What happens when it arrives"}</h2>
          <ol className="mt-4 space-y-3">
            {stages.map((item, index) => {
              const complete = stage > index;
              const running = stage === index && fileName !== null;
              return (
                <li key={item} className="flex gap-3 text-sm">
                  <span
                    className={cn(
                      "num flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
                      complete ? "bg-surface-inverse text-background" : "border border-line-strong text-muted-foreground",
                    )}
                  >
                    {complete ? (
                      <Check className="size-3.5" strokeWidth={2} aria-label="Done" />
                    ) : running ? (
                      <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} aria-label="In progress" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className={complete || running ? "" : "text-muted-foreground"}>{item}</span>
                </li>
              );
            })}
          </ol>

          {done ? (
            <div className="mt-6 border-t border-border pt-5">
              <JourneySteps
                steps={[
                  { label: "Brought in", detail: "Just now", state: "done" },
                  { label: "Cleaned", detail: "Next", state: "current" },
                  { label: "Approved", state: "todo" },
                  { label: "Analysed", state: "todo" },
                ]}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/clean/$datasetId" params={{ datasetId: sampleDatasetId }} className={signalButtonClass}>
                  <Wand2 className="size-4" strokeWidth={1.75} aria-hidden />
                  Clean this file
                </Link>
                <Link to="/datasets/$datasetId" params={{ datasetId: sampleDatasetId }} className={quietButtonClass}>
                  See its quality report
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </MainLayout>
  );
}
