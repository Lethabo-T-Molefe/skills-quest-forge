import { useMemo, useState } from "react";
import { Chip, HelpTip, MediaFrame, QuietButton } from "@/components";
import { media } from "@/config/media";
import { useAuditEvents } from "@/features/audit";
import { MainLayout } from "@/layouts/MainLayout";

export function AuditPage() {
  const events = useAuditEvents();
  const [query, setQuery] = useState("");
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
      <MediaFrame {...media.audit} ratio="16 / 7" className="mb-8" />

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by person, action or resource"
          className="w-full max-w-md rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5 text-sm"
        />
        <QuietButton
          onClick={() => {
            window.alert("Export is recorded as its own audit event. The log itself cannot be edited.");
          }}
        >
          Export for an auditor
        </QuietButton>
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
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
      </div>
      <div className="mt-6">
        <HelpTip>
          Sign-in, upload, profiling, cleaning, queries, AI actions, predictions, exports, sharing and role changes are
          all recorded. An auditor can reconstruct how any figure was produced.
        </HelpTip>
      </div>
    </MainLayout>
  );
}
