import { Link } from "@tanstack/react-router";
import { Panel } from "@/components";
import { useAuditEvents } from "../hooks/use-audit-events";

export function RecentActivityPanel({ limit = 5 }: { limit?: number }) {
  const events = useAuditEvents();

  return (
    <Panel>
      <h2 className="heading-2">Recent activity</h2>
      <ul className="mt-4 space-y-3">
        {events.slice(0, limit).map((e) => (
          <li key={e.id} className="flex gap-3 text-sm">
            <span className="num w-10 shrink-0 text-muted-foreground">{e.when}</span>
            <span className="min-w-0">
              <span className="font-medium">{e.action}</span>{" "}
              <span className="text-muted-foreground">{e.resource}</span>
            </span>
          </li>
        ))}
      </ul>
      <Link to="/audit" className="mt-4 inline-block text-sm text-signal-strong underline-offset-4 hover:underline">
        Open the audit trail
      </Link>
    </Panel>
  );
}
