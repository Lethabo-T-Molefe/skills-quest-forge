import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Chip, HelpTip, Notice, Panel, QuietButton, signalButtonClass } from "@/components";
import { MainLayout } from "@/layouts/MainLayout";

const stages = [
  "File landed in the object-storage landing zone",
  "Profiled for completeness, types, duplicates and outliers",
  "Scanned for personal information and masked matching columns",
  "Ready for the cleaning wizard. Bronze data stays immutable.",
];

export function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);

  function ingest(name: string) {
    setFileName(name);
    setStage(0);
    stages.forEach((_, index) => {
      window.setTimeout(() => setStage(index), 500 * (index + 1));
    });
  }

  const done = stage >= stages.length - 1 && fileName;

  return (
    <MainLayout
      label="governed upload"
      title="Upload a file"
      intro="A file lands in your workspace through the ingestion stream and never touches another member's space. It is profiled and scanned for personal information before it becomes usable."
    >
      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Panel>
          <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-line-strong px-6 py-16 text-center">
            <Upload className="size-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-4 font-medium">Drop a CSV here, or choose a file</p>
            <p className="mt-2 text-sm text-muted-foreground">CSV, TSV or a spreadsheet export. Max 250 MB in this prototype.</p>
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
          <div className="mt-4 flex justify-center">
            <QuietButton onClick={() => ingest("enrolments_q3.csv")}>Use a sample enrolment file</QuietButton>
          </div>
        </Panel>

        <Panel>
          <h2 className="heading-2">What happens on arrival</h2>
          <ol className="mt-4 space-y-3">
            {stages.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm">
                <Chip tone={stage >= index ? "ok" : "neutral"}>{index + 1}</Chip>
                <span className={stage >= index ? "" : "text-muted-foreground"}>{item}</span>
              </li>
            ))}
          </ol>
          {fileName ? (
            <Notice tone="ok" title={fileName} className="mt-4">
              Landed in the object-storage landing zone. Bronze stays immutable.
            </Notice>
          ) : null}
          {done ? (
            <Link to="/datasets/$datasetId/clean" params={{ datasetId: "learner-enrolments" }} className={`${signalButtonClass} mt-6 w-fit`}>
              Open the cleaning wizard
            </Link>
          ) : null}
          <div className="mt-6">
            <HelpTip>
              Classification is mandatory. Restricted-personal columns are masked before the data is promoted beyond
              the raw layer.
            </HelpTip>
          </div>
        </Panel>
      </div>
    </MainLayout>
  );
}
