import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Wand2, Sparkles, BarChart3, ShieldCheck, Lock } from "lucide-react";
import { AppShell, Chip, Panel, QuietButton, SignalButton } from "@/components/app-shell";
import { classificationLabel, datasets } from "@/lib/mock-data";

export const Route = createFileRoute("/datasets/$datasetId/")({
  loader: ({ params }) => {
    const dataset = datasets.find((d) => d.id === params.datasetId);
    if (!dataset) throw notFound();
    return { dataset };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.dataset.name ?? "Dataset";
    return {
      meta: [
        { title: `${name} — DataForge` },
        { name: "description", content: loaderData?.dataset.description ?? "Dataset profile and quality report." },
        { property: "og:title", content: `${name} — DataForge` },
        {
          property: "og:description",
          content: loaderData?.dataset.description ?? "Dataset profile and quality report.",
        },
      ],
    };
  },
  component: DatasetDetail,
});

function DatasetDetail() {
  const { dataset } = Route.useLoaderData();
  const q = dataset.quality;

  return (
    <AppShell
      label={dataset.source === "upload" ? "uploaded file" : "governed connector"}
      title={dataset.name}
      intro={dataset.description}
      actions={
        <>
          <Link to="/datasets/$datasetId/clean" params={{ datasetId: dataset.id }}>
            <SignalButton>
              <Wand2 className="size-4" strokeWidth={1.75} />
              Clean this data
            </SignalButton>
          </Link>
          <Link to="/explorer">
            <QuietButton>
              <BarChart3 className="size-4" strokeWidth={1.5} />
              Explore
            </QuietButton>
          </Link>
          <Link to="/assistant">
            <QuietButton>
              <Sparkles className="size-4" strokeWidth={1.5} />
              Ask about it
            </QuietButton>
          </Link>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Chip>{dataset.layer} layer</Chip>
        <Chip tone={dataset.status === "approved" ? "ok" : "warn"}>{dataset.status}</Chip>
        <Chip tone={dataset.classification === "restricted-personal" ? "signal" : "neutral"}>
          <ShieldCheck className="size-3.5" strokeWidth={1.75} />
          {classificationLabel[dataset.classification]}
        </Chip>
        <Chip>Owner · {dataset.owner}</Chip>
        <Chip>{dataset.sourceName}</Chip>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Panel>
          <h2 className="heading-2">Quality profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Measured on all <span className="num">{dataset.rows.toLocaleString("en-ZA")}</span> rows when the data
            arrived.
          </p>
          <div className="num mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {[
              ["Completeness", `${q.completeness}%`],
              ["Type conformance", `${q.conformance}%`],
              ["Duplicate rows", q.duplicates.toLocaleString("en-ZA")],
              ["Outliers", q.outliers.toLocaleString("en-ZA")],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface-raised p-4">
                <p className="font-sans text-xs text-muted-foreground">{k}</p>
                <p className="mt-1 font-display text-2xl font-light">{v}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-semibold">Columns</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-strong text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Column</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Missing</th>
                  <th className="py-2 pr-4 font-medium">Distinct</th>
                  <th className="py-2 font-medium">Sample</th>
                </tr>
              </thead>
              <tbody className="num">
                {dataset.columns.map((c) => (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-sans font-medium">
                      <span className="flex items-center gap-1.5">
                        {c.name}
                        {c.masked ? <Lock className="size-3.5 text-signal-strong" strokeWidth={1.75} /> : null}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-sans text-muted-foreground">{c.type}</td>
                    <td className={`py-2.5 pr-4 ${c.missingPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}>
                      {c.missingPct}%
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{c.distinct.toLocaleString("en-ZA")}</td>
                    <td className="py-2.5 text-muted-foreground">{c.sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Columns marked with a lock were detected as personal information and masked before this data became
            readable.
          </p>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel>
            <p className="label-paren">(before you ask)</p>
            <h2 className="heading-2 mt-1">What we noticed</h2>
            <ul className="mt-4 space-y-5">
              {dataset.insights.map((i) => (
                <li key={i.title} className="border-l-2 border-signal pl-4">
                  <p className="text-xs text-muted-foreground">{i.kind}</p>
                  <p className="mt-0.5 font-medium">{i.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
                  <div className="mt-2 flex gap-2">
                    <QuietButton>{i.suggestion}</QuietButton>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <h2 className="heading-2">Lineage</h2>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="num w-16 shrink-0 text-muted-foreground">bronze</span>
                <span>{dataset.sourceName} · raw, immutable</span>
              </li>
              <li className="flex gap-3">
                <span className="num w-16 shrink-0 text-muted-foreground">silver</span>
                <span className={dataset.layer === "bronze" ? "text-muted-foreground" : ""}>
                  {dataset.layer === "bronze" ? "Not cleaned yet" : "Cleaned, typed, masked, deduplicated"}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="num w-16 shrink-0 text-muted-foreground">gold</span>
                <span className={dataset.layer === "gold" ? "" : "text-muted-foreground"}>
                  {dataset.layer === "gold" ? "Published for dashboards and metrics" : "Not promoted"}
                </span>
              </li>
            </ol>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
