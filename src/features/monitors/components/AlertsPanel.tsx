import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useAlerts } from "../hooks/use-alerts";

/** Recent alerts, each linking to its plain-language explanation. */
export function AlertsPanel() {
  const alerts = useAlerts();

  if (alerts.length === 0) return <p className="text-sm text-muted-foreground">No alerts. Every watched metric is inside its band.</p>;

  return (
    <ul className="space-y-3">
      {alerts.map((alert) => (
        <li key={alert.id} className="flex gap-3">
          <AlertTriangle
            className={`mt-0.5 size-4 shrink-0 ${alert.severity === "high" ? "text-signal" : "text-warning"}`}
            strokeWidth={1.75}
            aria-label={alert.severity === "high" ? "High severity" : "Low severity"}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{alert.metric}</p>
            <p className="text-sm text-muted-foreground">
              {alert.message} · {alert.when}
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
