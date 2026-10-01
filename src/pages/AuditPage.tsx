import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Chip,
  ConfirmDialog,
  Notice,
  QuietButton,
  SearchField,
  SelectMenu,
  TableFrame,
} from "@/components";
import { auditEventsQuery, exportAuditTrail } from "@/features/audit";
import { canInspectAudit, orgMembersQuery, useCurrentUser } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";

const PAGE_SIZE = 25;
const EVERYONE = "__everyone__";

/** The value, a moment after the person stops typing, so each keystroke is not a request. */
function useDebounced<T>(value: T, delayMs = 300) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}

function fullTime(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "medium" }).format(
    new Date(iso),
  );
}

export function AuditPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const seesEveryone = canInspectAudit(user);
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState(EVERYONE);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [exportOpen, setExportOpen] = useState(false);
  const search = useDebounced(query.trim());

  const members = useQuery({ ...orgMembersQuery(), enabled: seesEveryone });
  const events = useQuery(
    auditEventsQuery({
      ...(search ? { q: search } : {}),
      ...(actor !== EVERYONE ? { actorId: actor } : {}),
      limit,
    }),
  );
  const shown = events.data?.items ?? [];
  const total = events.data?.total ?? 0;

  const download = useMutation({
    mutationFn: exportAuditTrail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Audit trail exported", {
        description: "The export is recorded as its own entry.",
      });
    },
    onError: notifyError("The audit trail could not be exported."),
  });

  return (
    <MainLayout
      title="Audit trail"
      description={
        seesEveryone
          ? "Every data and security action, with who did it and to what. No role can change an entry, so any figure can be traced back."
          : "Everything you have done here, with what it touched. No role can change an entry. Stewards, auditors and administrators see everyone's."
      }
      actions={
        <QuietButton disabled={download.isPending} onClick={() => setExportOpen(true)}>
          <Download className="size-4" strokeWidth={1.5} aria-hidden />
          {download.isPending ? "Exporting…" : "Export as CSV"}
        </QuietButton>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            className="max-w-sm"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="Filter by action, resource or detail"
          />
          {seesEveryone ? (
            <SelectMenu
              size="sm"
              ariaLabel="Person"
              className="w-56"
              value={actor}
              onValueChange={(value) => {
                setActor(value);
                setLimit(PAGE_SIZE);
              }}
              options={[
                { value: EVERYONE, label: "Everyone" },
                ...(members.data ?? []).map((member) => ({ value: member.id, label: member.name })),
              ]}
            />
          ) : null}
          <p className="num ml-auto text-xs text-muted-foreground" aria-live="polite">
            {events.isPending ? "Loading…" : `${shown.length} of ${total} entries`}
          </p>
        </div>

        {events.isError ? (
          <Notice tone="signal" title="The audit trail did not load">
            {errorMessage(events.error)}
          </Notice>
        ) : (
          <TableFrame label="Audit entries">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    When
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Who
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Resource
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((event) => (
                  <tr key={event.id} className="border-b border-border align-top last:border-0">
                    <td
                      className="num px-4 py-2.5 whitespace-nowrap text-muted-foreground"
                      title={fullTime(event.occurredAt)}
                    >
                      {event.when}
                    </td>
                    <td className="px-4 py-2.5">{event.actor}</td>
                    <td className="px-4 py-2.5">
                      <Chip>{event.action}</Chip>
                    </td>
                    <td className="px-4 py-2.5 break-words">{event.resource}</td>
                    <td className="px-4 py-2.5 break-words text-muted-foreground">
                      {event.detail}
                    </td>
                  </tr>
                ))}
                {events.isPending ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading the audit trail…
                    </td>
                  </tr>
                ) : shown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {search || actor !== EVERYONE
                        ? "No entries match. Clear the filters to see everything."
                        : "Nothing has been recorded yet."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </TableFrame>
        )}
        {total > shown.length ? (
          <QuietButton
            className="self-center"
            disabled={events.isFetching}
            onClick={() => setLimit((count) => count + PAGE_SIZE)}
          >
            {events.isFetching
              ? "Loading…"
              : `Show ${Math.min(PAGE_SIZE, total - shown.length)} more`}
          </QuietButton>
        ) : null}
      </div>

      <ConfirmDialog
        open={exportOpen}
        title="Export the audit trail"
        confirmLabel="Export"
        onConfirm={() => download.mutate()}
        onClose={() => setExportOpen(false)}
      >
        The newest 1 000 entries {seesEveryone ? "" : "of yours "}are downloaded as a CSV file. The
        export is recorded as its own audit entry, and the trail itself cannot be edited.
      </ConfirmDialog>
    </MainLayout>
  );
}
