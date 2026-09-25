import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip, ConfirmDialog, DatePicker, HelpTip, QuietButton, ScrollPane, SearchField } from "@/components";
import { useAuditEvents } from "@/features/audit";
import { MainLayout } from "@/layouts/MainLayout";

export function AuditPage() {
  const events = useAuditEvents();
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [exportOpen, setExportOpen] = useState(false);
  const shown = useMemo(
    () =>
      events.filter((event) =>
        `${event.actor} ${event.action} ${event.resource} ${event.detail}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [events, query],
  );

  return (
    <MainLayout
      label="immutable record"
      title="Audit trail"
      intro="Every security-relevant and data-relevant action is written here, tagged with the member and the resource. No role can alter an existing entry."
    >
      <div className="flex flex-wrap items-end gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Filter by person, action or resource"
        />
        <div className="w-full max-w-xs">
          <DatePicker label="From" value={fromDate} onChange={setFromDate} />
        </div>
        <QuietButton onClick={() => setExportOpen(true)}>Export for an auditor</QuietButton>
      </div>

      <ScrollPane className="mt-6 h-[28rem] border border-border" orientation="both">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">When</th>
              <th className="px-4 py-2.5 font-medium">Actor</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
              <th className="px-4 py-2.5 font-medium">Resource</th>
              <th className="px-4 py-2.5 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((event) => (
              <tr key={event.id} className="border-b border-border last:border-0">
                <td className="num px-4 py-2.5 text-muted-foreground">{event.when}</td>
                <td className="px-4 py-2.5">{event.actor}</td>
                <td className="px-4 py-2.5">
                  <Chip>{event.action}</Chip>
                </td>
                <td className="px-4 py-2.5">{event.resource}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{event.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollPane>
      <div className="mt-6">
        <HelpTip>
          Sign-in, upload, profiling, cleaning, queries, AI actions, predictions, exports, sharing and role changes are
          all recorded. An auditor can reconstruct how any figure was produced.
        </HelpTip>
      </div>

      <ConfirmDialog
        open={exportOpen}
        title="Export the audit trail"
        confirmLabel="Export"
        onConfirm={() => toast.success("Audit export recorded as its own event.")}
        onClose={() => setExportOpen(false)}
      >
        Export is recorded as its own audit event. The log itself cannot be edited.
      </ConfirmDialog>
    </MainLayout>
  );
}
