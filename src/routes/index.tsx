import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Upload, Sparkles, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell, Chip, Panel, QuietButton, SignalButton } from "@/components/app-shell";
import { alerts, datasets, metrics, auditEvents, currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workspace overview — DataForge" },
      {
        name: "description",
        content:
          "DataForge is a governed analytics workspace: upload data, clean it step by step, ask questions in plain English and share the answer.",
      },
      { property: "og:title", content: "Workspace overview — DataForge" },
      {
        property: "og:description",
        content: "Bring in data, clean it, ask questions in plain English and share governed answers.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <AppShell
      label="your workspace"
      title={`Good afternoon, ${currentUser.name.split(" ")[0]}.`}
      intro="Everything you run here is sandboxed, permission-checked and written to the audit trail. Start with a file, a question or a dataset someone has already cleaned."
      actions={
        <>
          <SignalButton>
            <Upload className="size-4" strokeWidth={1.75} />
            Upload data
          </SignalButton>
          <Link to="/assistant">
            <QuietButton>
              <Sparkles className="size-4" strokeWidth={1.5} />
              Ask a question
            </QuietButton>
          </Link>
        </>
      }
    >
      <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.name} className="bg-surface-raised p-5">
            <p className="text-sm text-muted-foreground">{m.name}</p>
            <p className="num mt-2 font-display text-4xl font-light">{m.value}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {m.trend === "up" ? (
                <TrendingUp className="size-3.5 text-success" strokeWidth={1.75} />
              ) : (
                <TrendingDown className="size-3.5 text-signal-strong" strokeWidth={1.75} />
              )}
              <span className="num">{m.delta}</span> vs last month
            </p>
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{m.definition}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="heading-2">Continue where you left off</h2>
            <Link to="/datasets" className="text-sm text-signal-strong underline-offset-4 hover:underline">
              All datasets
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {datasets.slice(0, 3).map((d) => (
              <li key={d.id} className="py-4 first:pt-0 last:pb-0">
                <Link
                  to="/datasets/$datasetId"
                  params={{ datasetId: d.id }}
                  className="group flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{d.name}</p>
                    <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{d.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip>{d.layer}</Chip>
                      <Chip tone={d.status === "approved" ? "ok" : "warn"}>{d.status}</Chip>
                      <Chip>
                        <span className="num">{d.rows.toLocaleString("en-ZA")}</span> rows
                      </Chip>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="heading-2">Alerts</h2>
            <ul className="mt-4 space-y-4">
              {alerts.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <AlertTriangle
                    className={`mt-0.5 size-4 shrink-0 ${a.severity === "high" ? "text-signal" : "text-muted-foreground"}`}
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-sm font-medium">{a.metric}</p>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    <Link
                      to="/monitors"
                      className="mt-1 inline-block text-xs text-signal-strong underline-offset-4 hover:underline"
                    >
                      Explain why
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <h2 className="heading-2">Recent activity</h2>
            <ul className="mt-4 space-y-3">
              {auditEvents.slice(0, 5).map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="num w-10 shrink-0 text-muted-foreground">{e.when}</span>
                  <span className="min-w-0">
                    <span className="font-medium">{e.action}</span>{" "}
                    <span className="text-muted-foreground">{e.resource}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/audit"
              className="mt-4 inline-block text-sm text-signal-strong underline-offset-4 hover:underline"
            >
              Open the audit trail
            </Link>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
