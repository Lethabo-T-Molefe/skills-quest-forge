import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Radar } from "lucide-react";
import { QuietButton } from "@/components";
import { notifyError } from "@/lib/notify";
import { insightFeedQuery, refreshMonitors, runScan } from "../api/monitors";

function since(iso: string | null) {
  if (!iso) return "has not run yet";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "ran just now";
  if (minutes < 60) return `ran ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `ran ${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `last ran ${new Date(iso).toLocaleDateString()}`;
}

/**
 * Unusual months the scheduled scan found in shared metrics nobody set a monitor on. Stewards can run the
 * scan on demand; everyone sees only findings on data they may analyse.
 */
export function InsightFeed({ canScan }: { canScan: boolean }) {
  const queryClient = useQueryClient();
  const feed = useQuery(insightFeedQuery());
  const scan = useMutation({
    mutationFn: runScan,
    onSuccess: async (result) => {
      await refreshMonitors(queryClient);
      toast.success(
        result.found.length
          ? `${result.found.length} unusual month${result.found.length === 1 ? "" : "s"} found`
          : "Nothing new is unusual",
        { description: `${result.scanned} dataset(s) scanned.` },
      );
    },
    onError: notifyError("The scan could not run."),
  });
  const alerts = feed.data?.alerts ?? [];

  return (
    <section aria-labelledby="scan-heading" className="panel mb-8 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="scan-heading" className="font-sans text-sm font-medium">
            Detected automatically
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every {feed.data?.everyHours ?? 24} hours DataForge checks the shared metrics on
            approved data for months that are unusual for the time of year, and explains what drove
            them. The scan {since(feed.data?.lastScan ?? null)}.
          </p>
        </div>
        {canScan ? (
          <QuietButton disabled={scan.isPending} onClick={() => scan.mutate()}>
            <Radar className="size-4" strokeWidth={1.5} aria-hidden />
            {scan.isPending ? "Scanning…" : "Scan now"}
          </QuietButton>
        ) : null}
      </div>
      {feed.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : alerts.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nothing unusual found.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {alerts.slice(0, 6).map((alert) => (
            <li key={alert.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{alert.metric}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              <Link
                to="/monitors/$alertId"
                params={{ alertId: alert.id }}
                className="text-sm text-signal-strong underline-offset-4 hover:underline"
              >
                See why<span className="sr-only">: {alert.metric}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
