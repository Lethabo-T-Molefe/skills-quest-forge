import { useMutation } from "@tanstack/react-query";
import { FileDown, ShieldCheck } from "lucide-react";
import { CodeBlock, Notice, QuietButton } from "@/components";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { auditReport, exportReport, type Report, type ReportFigure } from "./api";

function Provenance({ figure }: { figure: ReportFigure }) {
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground underline-offset-4 hover:underline">
        How {figure.id} was computed
      </summary>
      <div className="mt-2 space-y-1 text-muted-foreground">
        {figure.kind === "model" ? (
          <p>
            From {figure.model?.label}'s latest scoring run (
            {figure.scoringRun?.rows.toLocaleString()} records,{" "}
            {figure.scoringRun ? new Date(figure.scoringRun.at).toLocaleDateString() : ""}).
          </p>
        ) : (
          <>
            <p>
              {figure.datasetName} ·{" "}
              {figure.metric
                ? `shared metric “${figure.metric.name}”, version ${figure.metric.version}`
                : figure.measureLabel}
              {figure.period ? ` · ${figure.period.from} to ${figure.period.to}` : ""}
              {figure.rowPolicy ? " · your row filter applied" : ""}
            </p>
            <p className="num break-all">Sandbox session {figure.sessionId}</p>
            <CodeBlock code={figure.sql} />
          </>
        )}
      </div>
    </details>
  );
}

/** A generated report: the narrative, each figure with how it was computed, exports and a reproducibility check. */
export function ReportView({ report }: { report: Report }) {
  const check = useMutation({ mutationFn: () => auditReport(report.id) });
  const download = useMutation({
    mutationFn: (format: "pdf" | "xlsx") => exportReport(report.id, format),
    onError: notifyError("The export could not be made."),
  });
  const sections = [...new Set(report.figures.map((f) => f.section))];

  return (
    <article className="space-y-6" aria-labelledby="report-title">
      <header className="space-y-2">
        <h2 id="report-title" className="font-display text-2xl">
          {report.title}
        </h2>
        <p className="num text-sm text-muted-foreground">
          {report.period.from} to {report.period.to} · generated {report.when.toLowerCase()}
          {report.createdBy ? ` by ${report.createdBy}` : ""}
        </p>
        {report.disclaimer ? (
          <p className="text-xs text-muted-foreground">{report.disclaimer}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <QuietButton disabled={download.isPending} onClick={() => download.mutate("pdf")}>
            <FileDown className="size-4" strokeWidth={1.5} aria-hidden />
            PDF
          </QuietButton>
          <QuietButton disabled={download.isPending} onClick={() => download.mutate("xlsx")}>
            <FileDown className="size-4" strokeWidth={1.5} aria-hidden />
            Excel
          </QuietButton>
          <QuietButton disabled={check.isPending} onClick={() => check.mutate()}>
            <ShieldCheck className="size-4" strokeWidth={1.5} aria-hidden />
            {check.isPending ? "Checking…" : "Check it reproduces"}
          </QuietButton>
        </div>
      </header>

      {check.data ? (
        <Notice
          tone={check.data.mismatches.length === 0 ? "ok" : "signal"}
          title={`${check.data.reproduced} of ${check.data.figuresChecked} figures reproduce exactly`}
        >
          Every figure's SQL was run again against today's data.
          {check.data.suppressedCells > 0
            ? ` ${check.data.suppressedCells} small group(s) stay hidden.`
            : ""}
          {check.data.mismatches.length > 0
            ? ` Changed since it was generated: ${check.data.mismatches.map((m) => m.figure).join(", ")}.`
            : ""}
        </Notice>
      ) : null}
      {check.error ? (
        <Notice tone="signal" title="The check could not run">
          {errorMessage(check.error)}
        </Notice>
      ) : null}

      {report.narrative.length > 0 ? (
        <section className="panel space-y-2 p-5" aria-label="Summary">
          {report.narrative.map((paragraph) => (
            <p key={paragraph.template}>{paragraph.text}</p>
          ))}
          <p className="text-xs text-muted-foreground">
            Every number above is a figure below; the wording cannot introduce numbers of its own.
          </p>
        </section>
      ) : null}

      {report.skipped && report.skipped.length > 0 ? (
        <Notice tone="warn" title="Some figures were left out">
          <ul className="list-disc space-y-1 pl-4">
            {report.skipped.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {sections.map((section) => (
        <section key={section} className="panel p-5" aria-label={section}>
          <h3 className="font-display text-xl">{section}</h3>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            {report.figures
              .filter((figure) => figure.section === section)
              .map((figure) => (
                <div key={figure.id} className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="num mr-2 text-xs text-muted-foreground">{figure.id}</span>
                    {figure.label}
                  </p>
                  {figure.rows.length === 1 && figure.rows[0]?.group === null ? (
                    <p className="num mt-1 font-display text-3xl font-light">
                      {figure.rows[0].display}
                    </p>
                  ) : (
                    <table className="mt-2 w-full text-sm">
                      <tbody className="num">
                        {figure.rows.map((row) => (
                          <tr key={row.group ?? "total"} className="border-b border-border">
                            <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                              {row.group ?? "Total"}
                            </th>
                            <td
                              className={`py-1.5 text-right ${row.suppressed ? "text-muted-foreground" : ""}`}
                            >
                              {row.display}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <Provenance figure={figure} />
                </div>
              ))}
          </div>
        </section>
      ))}
    </article>
  );
}
