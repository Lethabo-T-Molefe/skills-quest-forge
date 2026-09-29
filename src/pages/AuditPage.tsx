import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Chip, ConfirmDialog, QuietButton, ScrollPane, SearchField, SelectMenu } from "@/components";
import { useAuditEvents } from "@/features/audit";
import { MainLayout } from "@/layouts/MainLayout";

export function AuditPage() {
  const events = useAuditEvents();
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("All");
  const [exportOpen, setExportOpen] = useState(false);
  const actors = useMemo(() => ["All", ...new Set(events.map((event) => event.actor))], [events]);
  const shown = useMemo(
    () =>
      events.filter(
        (event) =>
          (actor === "All" || event.actor === actor) &&
          `${event.actor} ${event.action} ${event.resource} ${event.detail}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [events, query, actor],
  );

  return (
    <MainLayout
      title="Audit trail"
      description="Every data and security action, with who did it and to what. No role can change an entry, so any figure can be traced back."
      actions={
        <QuietButton onClick={() => setExportOpen(true)}>
          <Download className="size-4" strokeWidth={1.5} aria-hidden />
          Export for an auditor
        </QuietButton>
      }
      fill
    >
      <div className="flex flex-col gap-3 lg:h-full">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField className="max-w-sm" value={query} onChange={setQuery} placeholder="Filter by action, resource or detail" />
          <SelectMenu
            size="sm"
            ariaLabel="Person"
            className="w-52"
            value={actor}
            onValueChange={setActor}
            options={actors.map((name) => ({ value: name, label: name === "All" ? "Everyone" : name }))}
          />
          <p className="num ml-auto text-xs text-muted-foreground">
            {shown.length} of {events.length} entries
          </p>
        </div>

        <ScrollPane className="min-h-[320px] border border-border bg-surface-raised lg:min-h-0 lg:flex-1" orientation="both">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Who</th>
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
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No entries match. Clear the filters to see everything.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </ScrollPane>
      </div>

      <ConfirmDialog
        open={exportOpen}
        title="Export the audit trail"
        confirmLabel="Export"
        onConfirm={() => toast.success("Audit trail exported", { description: "The export is recorded as its own entry." })}
        onClose={() => setExportOpen(false)}
      >
        The export is recorded as its own audit entry. The trail itself cannot be edited.
      </ConfirmDialog>
    </MainLayout>
  );
}
