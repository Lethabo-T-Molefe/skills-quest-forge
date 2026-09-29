import { Link } from "@tanstack/react-router";
import { useAuditEvents } from "../hooks/use-audit-events";

/** The latest audit entries, with a way into the full trail. */
export function RecentActivityPanel({ limit = 5 }: { limit?: number }) {
  const events = useAuditEvents();

  return (
    <div>
      <ul className="space-y-2">
        {events.slice(0, limit).map((e) => (
          <li key={e.id} className="flex gap-3 text-sm">
            <span className="num w-10 shrink-0 text-muted-foreground">{e.when}</span>
            <span className="min-w-0">
              <span className="font-medium">{e.action}</span> <span className="text-muted-foreground">{e.resource}</span>
            </span>
          </li>
        ))}
      </ul>
      <Link to="/audit" className="mt-3 inline-block text-sm text-signal-strong underline-offset-4 hover:underline">
        Open the audit trail
      </Link>
    </div>
  );
}
