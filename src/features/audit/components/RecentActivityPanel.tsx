import { Link } from "@tanstack/react-router";
import { RECENT_ACTIVITY_LIMIT } from "../api/audit-events";
import { useRecentAuditEvents } from "../hooks/use-audit-events";

/** The latest audit entries, with a way into the full trail. */
export function RecentActivityPanel() {
  const events = useRecentAuditEvents(RECENT_ACTIVITY_LIMIT);

  return (
    <div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing has been recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="flex gap-3 text-sm">
              <span className="num w-20 shrink-0 text-muted-foreground">{e.when}</span>
              <span className="min-w-0">
                <span className="font-medium">{e.action}</span>{" "}
                <span className="break-words text-muted-foreground">{e.resource}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/audit"
        className="mt-3 inline-block text-sm text-signal-strong underline-offset-4 hover:underline"
      >
        Open the audit trail
      </Link>
    </div>
  );
}
