import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, FileSpreadsheet, LoaderCircle, Upload, Wand2, X } from "lucide-react";
import {
  BackLink,
  Field,
  HelpTip,
  JourneySteps,
  Notice,
  QuietButton,
  SelectMenu,
  SignalButton,
  TextArea,
  TextInput,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import {
  classificationHint,
  classificationLabel,
  refreshDatasets,
  uploadDataset,
  visibilityLabel,
  type Classification,
  type Dataset,
  type Visibility,
} from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const stages = [
  "The file lands in your private area",
  "Its quality is measured: completeness, types, repeats and extremes",
  "Personal information is found and masked",
  "It is ready to clean. The original is kept as it arrived",
];

const ACCEPT = ".csv,.tsv,.txt,.xlsx,.xls,.json,.jsonl";
const MAX_MB = 250;
const SAMPLE = { url: "/samples/enrolments_sample.csv", name: "enrolments_sample.csv" };

const classifications = Object.keys(classificationLabel) as Classification[];
const visibilities = Object.keys(visibilityLabel) as Visibility[];

function fileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function UploadPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState<Classification>("internal-confidential");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [dragging, setDragging] = useState(false);
  const mayUpload = hasPermission(user, "upload");

  const upload = useMutation({
    mutationFn: (chosen: File) =>
      uploadDataset(chosen, { name, description, classification, visibility }),
    onSuccess: () => refreshDatasets(queryClient),
  });

  function choose(next: File | undefined) {
    if (!next) return;
    upload.reset();
    if (next.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setFileError(
        `${next.name} is ${fileSize(next.size)}. Files up to ${MAX_MB} MB can be uploaded.`,
      );
      return;
    }
    setFileError(null);
    setFile(next);
  }

  async function loadSample() {
    setFileError(null);
    try {
      const response = await fetch(SAMPLE.url);
      if (!response.ok) throw new Error("missing");
      choose(new File([await response.blob()], SAMPLE.name, { type: "text/csv" }));
    } catch {
      setFileError("The sample file could not be loaded. Choose a file of your own.");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (file && !upload.isPending) upload.mutate(file);
  }

  const done = upload.data;

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title="Upload a file"
      description="A file stays private to your workspace unless you choose otherwise. It is measured and checked for personal information before anyone can use it."
    >
      {!mayUpload ? (
        <Notice className="mb-5" tone="warn" title="Your role cannot bring data in">
          You can look at datasets that are shared with you. Ask an analyst or a steward to upload
          this file.
        </Notice>
      ) : null}
      {!user.verified ? (
        <Notice className="mb-5" tone="warn" title="Verify your email first">
          Uploading is available once your email address is verified.
        </Notice>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <form className="panel space-y-5 p-5" aria-label="Choose a file" onSubmit={submit}>
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              choose(event.dataTransfer.files[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-12 text-center transition-colors",
              "focus-within:ring-2 focus-within:ring-signal",
              dragging ? "border-signal bg-signal-tint" : "border-line-strong hover:bg-accent/30",
            )}
          >
            <Upload className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <span className="mt-3 font-medium">Drop a file here, or choose one</span>
            <span className="mt-1 text-sm text-muted-foreground">
              CSV, TSV, Excel or JSON, up to {MAX_MB} MB.
            </span>
            <input
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={!mayUpload}
              onChange={(event) => {
                choose(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>

          {fileError ? (
            <p className="text-sm text-destructive" role="alert">
              {fileError}
            </p>
          ) : null}

          {file ? (
            <div className="flex items-center justify-between gap-3 border border-border bg-surface-alt px-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet
                  className="size-5 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium break-all">{file.name}</span>
                  <span className="num block text-xs text-muted-foreground">
                    {fileSize(file.size)}
                  </span>
                </span>
              </span>
              <button
                type="button"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => {
                  setFile(null);
                  upload.reset();
                }}
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">Remove {file.name}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <QuietButton disabled={!mayUpload} onClick={() => void loadSample()}>
                Use a sample enrolment file
              </QuietButton>
              <HelpTip title="What if my file has personal information?">
                That is expected. Columns such as names and ID numbers are detected and masked
                before the data moves beyond the raw layer.
              </HelpTip>
            </div>
          )}

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <Field label="Name" hint="Leave empty to use the file name.">
              <TextInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Learner enrolments 2026"
                maxLength={200}
              />
            </Field>
            <SelectMenu
              label="Who can see it"
              value={visibility}
              onValueChange={(value) => setVisibility(value as Visibility)}
              options={visibilities.map((value) => ({ value, label: visibilityLabel[value] }))}
            />
            <div className="sm:col-span-2">
              <Field label="What it holds" hint="One line helps others find and trust it.">
                <TextArea
                  rows={2}
                  className="font-sans"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Raw enrolment export from the training portal, one row per enrolment."
                  maxLength={4000}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <SelectMenu
                label="Classification"
                value={classification}
                onValueChange={(value) => setClassification(value as Classification)}
                options={classifications.map((value) => ({
                  value,
                  label: classificationLabel[value],
                }))}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {classificationHint[classification]} If personal information is found, the file is
                classified as restricted whatever is chosen here.
              </p>
            </div>
          </div>

          <SignalButton
            type="submit"
            disabled={
              !file || !mayUpload || !user.verified || upload.isPending || done !== undefined
            }
          >
            {upload.isPending ? (
              <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
            ) : (
              <Upload className="size-4" strokeWidth={1.75} aria-hidden />
            )}
            {upload.isPending ? "Uploading and measuring…" : "Upload"}
          </SignalButton>
        </form>

        <section className="panel flex flex-col p-5" aria-label="Progress" aria-live="polite">
          <h2 className="font-display text-xl break-words">
            {done ? done.name : file ? file.name : "What happens when it arrives"}
          </h2>
          <ol className="mt-4 space-y-3">
            {stages.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm">
                <span
                  className={cn(
                    "num flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
                    done
                      ? "bg-surface-inverse text-background"
                      : "border border-line-strong text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={2} aria-label="Done" />
                  ) : upload.isPending ? (
                    <LoaderCircle
                      className="size-3.5 animate-spin"
                      strokeWidth={2}
                      aria-label="In progress"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={done || upload.isPending ? "" : "text-muted-foreground"}>
                  {item}
                </span>
              </li>
            ))}
          </ol>

          {upload.isError ? (
            <Notice className="mt-5" tone="signal" title="The file was not uploaded">
              {errorMessage(upload.error, "Check the file and try again.")}
            </Notice>
          ) : null}

          {done ? <UploadResult dataset={done} /> : null}
        </section>
      </div>
    </MainLayout>
  );
}

function UploadResult({ dataset }: { dataset: Dataset }) {
  const masked = Object.keys(dataset.piiColumns);
  return (
    <div className="mt-6 border-t border-border pt-5">
      <dl className="num grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="font-sans text-xs text-muted-foreground">Rows</dt>
          <dd className="font-display text-2xl font-light">{formatNumber(dataset.rows)}</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-muted-foreground">Complete</dt>
          <dd className="font-display text-2xl font-light">{dataset.quality.completeness}%</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-muted-foreground">Repeated rows</dt>
          <dd className="font-display text-2xl font-light">
            {formatNumber(dataset.quality.duplicates)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">
        {masked.length > 0
          ? `Masked as personal information: ${masked.join(", ")}. Classified as ${dataset.classificationLabel.toLowerCase()}.`
          : "No personal information was found."}{" "}
        {dataset.insights.length > 0
          ? `${dataset.insights.length} ${dataset.insights.length === 1 ? "thing was" : "things were"} noticed and ${dataset.insights.length === 1 ? "is" : "are"} listed on the dataset.`
          : ""}
      </p>
      <JourneySteps className="mt-5" steps={dataset.journey} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/clean/$datasetId"
          params={{ datasetId: dataset.id }}
          className={signalButtonClass}
        >
          <Wand2 className="size-4" strokeWidth={1.75} aria-hidden />
          Clean this file
        </Link>
        <Link
          to="/datasets/$datasetId"
          params={{ datasetId: dataset.id }}
          className={quietButtonClass}
        >
          See its quality report
        </Link>
      </div>
    </div>
  );
}
