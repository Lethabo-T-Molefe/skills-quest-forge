import { Link, notFound, useParams } from "@tanstack/react-router";
import { Chip, HelpTip, Notice, Panel, quietButtonClass } from "@/components";
import { useAlert } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function AlertDetailPage() {
  const { alertId } = useParams({ from: "/monitors/$alertId" });
  const alert = useAlert(alertId);
  if (!alert) throw notFound();

  return (
    <MainLayout
      label="root-cause explanation"
      title={alert.metric}
      intro={alert.message}
      actions={
        <Link to="/assistant" className={quietButtonClass}>
          Ask a follow-up
        </Link>
      }
    >
      <Notice tone={alert.severity === "high" ? "signal" : "warn"} title={alert.metric}>
        {alert.message}
      </Notice>
      <div className="mt-6 flex flex-wrap gap-2">
        <Chip tone={alert.severity === "high" ? "signal" : "ok"}>{alert.severity}</Chip>
        <Chip>{alert.when}</Chip>
      </div>

      <Panel className="mt-8">
        <h2 className="heading-2">Why it moved</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          The main contributing factors, with the supporting figures. This is a plain-language reading, not a guess.
        </p>
        <ul className="mt-6 space-y-5">
          {alert.rootCause.map((factor) => (
            <li key={factor.factor} className="grid gap-2 border-b border-border pb-5 last:border-0 last:pb-0 sm:grid-cols-[7fr_5fr]">
              <div>
                <p className="font-medium">{factor.factor}</p>
                <p className="mt-1 text-sm text-muted-foreground">{factor.detail}</p>
              </div>
              <p className="num font-display text-3xl font-light">{factor.contribution}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <HelpTip>
            Root-cause explanations use the same semantic-layer metrics as dashboards and the assistant, so the figures
            stay consistent.
          </HelpTip>
        </div>
      </Panel>
    </MainLayout>
  );
}
