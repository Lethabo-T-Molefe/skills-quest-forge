import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Panel } from "@/components";
import { useAlerts } from "../hooks/use-alerts";

export function AlertsPanel() {
  const alerts = useAlerts();

  return (
    <Panel>
      <h2 className="heading-2">Alerts</h2>
      <ul className="mt-4 space-y-4">
        {alerts.map((a) => (
          <li key={a.id} className="flex gap-3">
            <AlertTriangle
              className={`mt-0.5 size-4 shrink-0 ${a.severity === "high" ? "text-signal" : "text-muted-foreground"}`}
              strokeWidth={1.75}
            />
            <div>
              <p className="text-sm font-medium">{a.metric}</p>
              <p className="text-sm text-muted-foreground">{a.message}</p>
              <Link
                to="/monitors/$alertId"
                params={{ alertId: a.id }}
                className="mt-1 inline-block text-xs text-signal-strong underline-offset-4 hover:underline"
              >
                Explain why
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
