import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useAlerts } from "../hooks/use-alerts";

/** Recent alerts, each linking to its plain-language explanation. */
export function AlertsPanel({ limit = 4 }: { limit?: number }) {
  const alerts = useAlerts();
  // What still needs someone's attention comes first.
  const ordered = [...alerts].sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged));

  if (alerts.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        No alerts. Every watched metric is inside its limits.
      </p>
    );

  return (
    <ul className="space-y-3">
      {ordered.slice(0, limit).map((alert) => (
        <li key={alert.id} className="flex gap-3">
          <AlertTriangle
            className={`mt-0.5 size-4 shrink-0 ${
              alert.acknowledged
                ? "text-muted-foreground"
                : alert.severity === "high"
                  ? "text-signal"
                  : "text-warning"
            }`}
            strokeWidth={1.75}
            aria-label={alert.severity === "high" ? "High severity" : "Low severity"}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{alert.metric}</p>
            <p className="text-sm text-muted-foreground">
              {alert.message} · {alert.when}
              {alert.acknowledged ? " · acknowledged" : ""}
            </p>
            <Link
              to="/monitors/$alertId"
              params={{ alertId: alert.id }}
              className="text-xs text-signal-strong underline-offset-4 hover:underline"
            >
              Explain why
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
