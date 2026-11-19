import { useState } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { Notice, SelectMenu, SideRail, SignalButton, SplitLayout } from "@/components";
import { useAnalysisDatasets } from "@/features/analysis";
import { hasPermission, useCurrentUser } from "@/features/auth";
import {
  ReportView,
  generateReport,
  reportQuery,
  reportTemplatesQuery,
  reportsQuery,
  type Report,
} from "@/features/reports";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";

const DEFAULT = "__default__";

/** Governed reports: pick a template and datasets, and every figure is computed with its SQL kept beside it. */
export function ReportsPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const mayReport = hasPermission(user, "analyse");
  const templates = useSuspenseQuery(reportTemplatesQuery()).data;
  const datasets = useAnalysisDatasets();
  const earlier = useQuery({ ...reportsQuery(), enabled: mayReport });
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "auto");
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [from, setFrom] = useState(DEFAULT);
  const [to, setTo] = useState(DEFAULT);
  const [shownId, setShownId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Report | null>(null);
  const shown = useQuery({
    ...reportQuery(shownId ?? ""),
    enabled: Boolean(shownId) && fresh?.id !== shownId,
  });

  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const primary = datasets.find((d) => d.id === roles["primary"]);
  const months = primary?.months ?? [];

  const generate = useMutation({
    mutationFn: () =>
      generateReport({
        templateId,
        datasets: roles,
        ...(from !== DEFAULT && to !== DEFAULT ? { period: { from, to } } : {}),
      }),
    onSuccess: async (report) => {
      setFresh(report);
      setShownId(report.id);
      await queryClient.invalidateQueries({ queryKey: ["reports", "list"] });
    },
  });
  const report = fresh && fresh.id === shownId ? fresh : shown.data;

  return (
    <MainLayout
      title="Reports"
      description="Reports built from shared metrics. Every figure keeps the SQL that produced it and can be re-checked; small groups are hidden; the wording cannot introduce numbers of its own."
    >
      {!mayReport ? (
        <Notice tone="warn" title="Your role cannot produce reports" />
      ) : (
        <SplitLayout
          railWidth="22rem"
          railFirstOnMobile
          rail={
            <SideRail label="Make a report" className="panel flex flex-col gap-4 p-6">
              <h2 className="font-display text-xl">Make a report</h2>
              <SelectMenu
                label="Template"
                value={templateId}
                onValueChange={(next) => {
                  setTemplateId(next);
                  setRoles({});
                }}
                options={templates.map((t) => ({ value: t.id, label: t.title }))}
              />
              {template ? (
                <p className="text-xs text-muted-foreground">{template.description}</p>
              ) : null}
              {Object.entries(template?.roles ?? {}).map(([role, description]) => (
                <SelectMenu
                  key={role}
                  label={description}
                  value={roles[role] ?? ""}
                  onValueChange={(next) => setRoles((current) => ({ ...current, [role]: next }))}
                  options={datasets.map((d) => ({ value: d.id, label: d.name }))}
                  placeholder="Choose a dataset"
                />
              ))}
              {months.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <SelectMenu
                    label="From"
                    value={from}
                    onValueChange={setFrom}
                    options={[
                      { value: DEFAULT, label: "Last 12 months" },
                      ...months.map((m) => ({ value: m.id, label: m.label })),
                    ]}
                  />
                  <SelectMenu
                    label="To"
                    value={to}
                    onValueChange={setTo}
                    options={[
                      { value: DEFAULT, label: "Latest" },
                      ...months.map((m) => ({ value: m.id, label: m.label })),
                    ]}
                  />
                </div>
              ) : null}
              <SignalButton
                className="w-fit"
                disabled={!roles["primary"] || generate.isPending}
                onClick={() => generate.mutate()}
              >
                <FileText className="size-4" strokeWidth={1.75} aria-hidden />
                {generate.isPending ? "Computing every figure…" : "Generate"}
              </SignalButton>
              {generate.error ? (
                <Notice tone="signal" title="The report could not be made">
                  {errorMessage(generate.error)}
                </Notice>
              ) : null}
              {earlier.data && earlier.data.length > 0 ? (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium">Earlier reports</h3>
                  <ul className="mt-2 space-y-1.5">
                    {earlier.data.slice(0, 8).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={item.id === shownId ? "true" : undefined}
                          className="w-full text-left text-sm underline-offset-4 hover:underline aria-[current]:font-medium"
                          onClick={() => setShownId(item.id)}
                        >
                          {item.title}
                          <span className="block text-xs text-muted-foreground">
                            {item.period.from} to {item.period.to} · {item.when.toLowerCase()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </SideRail>
          }
        >
          {report ? (
            <ReportView report={report} />
          ) : shown.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading the report…</p>
          ) : (
            <section className="panel p-8 text-center" aria-label="Report">
              <p className="font-display text-xl">No report open</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Choose a template and its datasets, then generate. Each figure is computed in the
                sandbox under your role, and you can see the SQL behind it.
              </p>
            </section>
          )}
        </SplitLayout>
      )}
    </MainLayout>
  );
}
