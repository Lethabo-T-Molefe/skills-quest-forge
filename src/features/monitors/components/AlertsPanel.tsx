import { Link } from "@tanstack/react-router";
import { Notice, Panel } from "@/components";
import { useAlerts } from "../hooks/use-alerts";

export function AlertsPanel() {
  const alerts = useAlerts();

  return (
    <Panel>
      <h2 className="heading-2">Alerts</h2>
      <ul className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Notice
              tone={alert.severity === "high" ? "signal" : "warn"}
              title={alert.metric}
              action={
                <Link
                  to="/monitors/$alertId"
                  params={{ alertId: alert.id }}
                  className="text-xs text-signal-strong underline-offset-4 hover:underline"
                >
                  Explain why
                </Link>
              }
            >
              {alert.message}
            </Notice>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
