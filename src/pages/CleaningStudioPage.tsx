import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Upload, Wand2 } from "lucide-react";
import {
  Chip,
  Notice,
  Panel,
  QuietButton,
  quietButtonClass,
  SearchField,
  signalButtonClass,
} from "@/components";
import { canClean, isReadOnly, useCurrentUser } from "@/features/auth";
import { methodFamilies } from "@/features/cleaning";
import { classificationLabel, useDatasets, type Dataset } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";

const stages = [
  { n: "01", title: "Profile", body: "Read emptiness, types, duplicates and why blanks are blank. Nothing is rewritten." },
  { n: "02", title: "Clean one family at a time", body: "Missing values, repeats, extremes, formats, types, labels, shape and rules." },
  { n: "03", title: "Preview, then accept", body: "Each step shows a sample before and after. Skip what does not apply." },
  { n: "04", title: "Save a silver recipe", body: "The raw file stays in bronze. The recipe is versioned so you can rerun it." },
] as const;

function readiness(dataset: Dataset) {
  if (dataset.layer === "bronze") return { tone: "signal" as const, label: "Needs cleaning" };
  if (dataset.layer === "silver") return { tone: "ok" as const, label: "Recipe can be rerun" };
  return { tone: "neutral" as const, label: "Already gold" };
}

export function CleaningStudioPage() {
  const datasets = useDatasets();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<"queue" | "all">("queue");

  const queue = datasets.filter((item) => item.layer === "bronze");
  const source = focus === "queue" ? queue : datasets;
  const shown = source.filter((item) =>
    `${item.name} ${item.description} ${item.owner}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <MainLayout
      label="cleaning studio"
      title="Clean data"
      intro="This is the place to turn a raw file into a silver table. Start with the profile, work one family of problems at a time, and leave bronze untouched. Everyday language first. Expert methods when you need them."
      actions={
        <>
          <Link to="/datasets/upload" className={signalButtonClass}>
            <Upload className="size-4" strokeWidth={1.75} />
            Upload a file
          </Link>
          <Link to="/datasets" className={quietButtonClass}>
            Browse the catalogue
          </Link>
        </>
      }
    >
      <Notice tone="info" title="Bronze never changes">
        Accepted steps write a versioned recipe and a silver dataset. The landing file stays immutable, so the work is
        always reversible and auditable.
      </Notice>

      {!canClean(user) || isReadOnly(user) ? (
        <Notice className="mt-4" tone="warn" title="This role is read-only here">
          You can inspect profiles and recipes. Accepting a step is reserved for analysts, practitioners, stewards and
          administrators.
        </Notice>
      ) : null}

      <ol className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <li key={stage.n} className="bg-surface-raised p-5">
            <p className="label-paren">({stage.n})</p>
            <h2 className="heading-2 mt-1">{stage.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{stage.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 lg:grid-cols-[7fr_5fr]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-paren">(choose a file)</p>
              <h2 className="heading-2 mt-1">Open the studio</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <QuietButton active={focus === "queue"} onClick={() => setFocus("queue")}>
                Needs cleaning
              </QuietButton>
              <QuietButton active={focus === "all"} onClick={() => setFocus("all")}>
                All datasets
              </QuietButton>
            </div>
          </div>

          <SearchField
            className="mt-5 max-w-md"
            value={query}
            onChange={setQuery}
            placeholder="Search by name, owner or description"
          />

          {shown.length === 0 ? (
            <Panel className="mt-6">
              <h3 className="heading-2">
                {focus === "queue" ? "Nothing is waiting in bronze" : "Nothing matched"}
              </h3>
              <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
                {focus === "queue"
                  ? "Upload a file or switch to all datasets to rerun a silver recipe."
                  : "Try another name, or clear the search."}
              </p>
              <Link to="/datasets/upload" className={`${signalButtonClass} mt-5 w-fit`}>
                Upload a file
              </Link>
            </Panel>
          ) : (
            <ul className="mt-6 space-y-3">
              {shown.map((dataset) => {
                const state = readiness(dataset);
                return (
                  <li key={dataset.id}>
                    <Panel>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="label-paren">({dataset.layer})</p>
                          <h3 className="heading-2 mt-1">{dataset.name}</h3>
                          <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">{dataset.description}</p>
                        </div>
                        <Chip tone={state.tone}>{state.label}</Chip>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Chip>{classificationLabel[dataset.classification]}</Chip>
                        <Chip>{formatNumber(dataset.rows)} rows</Chip>
                        <Chip>{dataset.quality.completeness}% complete</Chip>
                        <Chip>{formatNumber(dataset.quality.duplicates)} duplicates</Chip>
                        <Chip>{formatNumber(dataset.quality.outliers)} outliers</Chip>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          to="/datasets/$datasetId/clean"
                          params={{ datasetId: dataset.id }}
                          className={signalButtonClass}
                        >
                          <Wand2 className="size-4" strokeWidth={1.75} />
                          {dataset.layer === "bronze" ? "Start cleaning" : "Open the recipe"}
                        </Link>
                        <Link
                          to="/datasets/$datasetId"
                          params={{ datasetId: dataset.id }}
                          className={quietButtonClass}
                        >
                          Dataset profile
                        </Link>
                      </div>
                    </Panel>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <Panel>
            <p className="label-paren">(what you can do here)</p>
            <h2 className="heading-2 mt-1">The method families</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everyday choices are marked in the wizard. Expert mode keeps the full catalogue in the same place.
            </p>
            <ul className="mt-5 space-y-4">
              {methodFamilies.map((family) => (
                <li key={family.id}>
                  <p className="text-sm font-medium">{family.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{family.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </MainLayout>
  );
}
