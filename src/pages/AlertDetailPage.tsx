import { Link, notFound, useParams } from "@tanstack/react-router";
import { BarChart3, MessageSquareText } from "lucide-react";
import { BackLink, Chip, quietButtonClass, signalButtonClass } from "@/components";
import { useAlert } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function AlertDetailPage() {
  const { alertId } = useParams({ from: "/monitors/$alertId" });
  const alert = useAlert(alertId);
  if (!alert) throw notFound();

  return (
    <MainLayout
      back={<BackLink to="/monitors">All monitors</BackLink>}
      title={alert.metric}
      description={`${alert.message}.`}
      actions={
        <>
          <Link to="/analyse/ask" className={quietButtonClass}>
            <MessageSquareText className="size-4" strokeWidth={1.5} aria-hidden />
            Ask a follow-up
          </Link>
          {alert.explore ? (
            <Link
              to="/analyse/build"
              search={{
                dataset: alert.explore.dataset,
                method: alert.explore.method,
                measure: alert.explore.measure,
                dimension: alert.explore.dimension,
              }}
              className={signalButtonClass}
            >
              <BarChart3 className="size-4" strokeWidth={1.75} aria-hidden />
              Explore this change
            </Link>
          ) : null}
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Chip tone={alert.severity === "high" ? "signal" : "ok"}>{alert.severity === "high" ? "High severity" : "Low severity"}</Chip>
        <Chip>Raised {alert.when}</Chip>
      </div>

      <section className="panel mt-5 max-w-4xl p-5" aria-labelledby="why-heading">
        <h2 id="why-heading" className="font-display text-xl">
          Why it moved
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The main contributing factors, with the figures behind them. They use the same shared metrics as dashboards
          and the assistant, so the numbers agree.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {alert.rootCause.map((factor) => (
            <li key={factor.factor} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className="font-medium">{factor.factor}</p>
                <p className="text-sm text-muted-foreground">{factor.detail}</p>
              </div>
              <p className="num font-display text-3xl font-light">{factor.contribution}</p>
            </li>
          ))}
        </ul>
        {alert.explore ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Want to check it yourself? Explore this change opens the chart builder with the same data, where you choose
            how the change is broken down.
          </p>
        ) : null}
      </section>
    </MainLayout>
  );
}
