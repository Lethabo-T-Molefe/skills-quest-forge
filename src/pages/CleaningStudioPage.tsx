import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Library, Upload, Wand2 } from "lucide-react";
import {
  Chip,
  Drawer,
  EmptyState,
  QuietButton,
  SearchField,
  Segmented,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { canApprove, canClean, useCurrentUser } from "@/features/auth";
import { MethodLibrary, useCleaningCatalogue } from "@/features/cleaning";
import { useDatasets, type Dataset } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";

function problems(dataset: Dataset) {
  const q = dataset.quality;
  const list: string[] = [];
  if (q.completeness < 100) list.push(`${100 - q.completeness}% of cells empty`);
  if (q.conformance < 100) list.push(`${100 - q.conformance}% of values in the wrong format`);
  if (q.duplicates > 0) list.push(`${formatNumber(q.duplicates)} repeated rows`);
  if (q.outliers > 0) list.push(`${formatNumber(q.outliers)} extreme values`);
  return list;
}

export function CleaningStudioPage() {
  const datasets = useDatasets();
  const catalogue = useCleaningCatalogue();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<"queue" | "all">("queue");
  const [libraryOpen, setLibraryOpen] = useState(false);

  const queue = datasets.filter((item) => item.layer === "bronze" && item.status !== "rejected");
  const source = focus === "queue" ? queue : datasets;
  const shown = source.filter((item) =>
    `${item.name} ${item.description} ${item.owner}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const roleCanClean = canClean(user);

  return (
    <MainLayout
      title="Clean"
      description="Turn a raw file into a clean, typed and masked table. Pick a file: you will see its problems first, then fix them one at a time."
      actions={
        <>
          <QuietButton onClick={() => setLibraryOpen(true)}>
            <Library className="size-4" strokeWidth={1.5} aria-hidden />
            What can be fixed
          </QuietButton>
          <Link to="/datasets/upload" className={quietButtonClass}>
            <Upload className="size-4" strokeWidth={1.5} aria-hidden />
            Upload a file
          </Link>
        </>
      }
    >
      {!roleCanClean ? (
        <p className="mb-4 text-sm text-warning">
          Your role can look through profiles and recipes here, but cannot change data.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Which files"
          value={focus}
          onValueChange={setFocus}
          options={[
            { value: "queue", label: `Needs cleaning (${queue.length})` },
            { value: "all", label: `All datasets (${datasets.length})` },
          ]}
        />
        <SearchField
          className="max-w-sm"
          value={query}
          onChange={setQuery}
          placeholder="Search by name, owner or description"
        />
      </div>

      {shown.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title={
              focus === "queue" && !query ? "Nothing is waiting to be cleaned" : "Nothing matched"
            }
            body={
              focus === "queue" && !query
                ? "Every raw file has been cleaned. Upload a new file, or show all datasets to rerun a recipe."
                : "Try another name, or clear the search."
            }
            action={
              <Link to="/datasets/upload" className={signalButtonClass}>
                Upload a file
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-border border border-border bg-surface-raised">
          {shown.map((dataset) => {
            const raw = dataset.layer === "bronze";
            const found = problems(dataset);
            // The API allows cleaning by the owner or a steward; everyone else can look.
            const mayClean = roleCanClean && (dataset.ownerId === user.id || canApprove(user));
            return (
              <li
                key={dataset.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1 basis-80">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/datasets/$datasetId"
                      params={{ datasetId: dataset.id }}
                      className="font-display text-lg underline-offset-4 hover:underline"
                    >
                      {dataset.name}
                    </Link>
                    <Chip tone={raw ? "signal" : "ok"}>
                      {raw ? "Needs cleaning" : "Recipe saved"}
                    </Chip>
                  </div>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    {dataset.layerLabel} · {formatNumber(dataset.rows)} rows · owner {dataset.owner}
                  </p>
                </div>
                <p className="min-w-0 flex-1 basis-64 text-sm text-muted-foreground">
                  {found.length > 0 ? found.join(" · ") : "No quality problems found"}
                </p>
                <Link
                  to="/clean/$datasetId"
                  params={{ datasetId: dataset.id }}
                  className={raw && mayClean ? signalButtonClass : quietButtonClass}
                >
                  <Wand2 className="size-4" strokeWidth={1.75} aria-hidden />
                  {!mayClean ? "View the steps" : raw ? "Start cleaning" : "Open the recipe"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Cleaning covers missing values, repeats, extreme values, formats, types, labels, table
        shape, rules, contradictions and personal information. The original file is never changed.
      </p>

      <Drawer open={libraryOpen} title="What can be fixed" onClose={() => setLibraryOpen(false)}>
        <MethodLibrary chapters={catalogue.chapters} methods={catalogue.methods} />
      </Drawer>
    </MainLayout>
  );
}
