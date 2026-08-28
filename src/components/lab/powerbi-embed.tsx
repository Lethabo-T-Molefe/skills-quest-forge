import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "./panel";
import { PowerBiReport } from "./powerbi-report";
import { usePowerBiEmbedConfig } from "@/lib/queries/powerbi";
import type { PowerBiEmbedConfig } from "@/lib/api/powerbi";

// powerbi-client-react (and its powerbi-client dependency) reference `self`,
// a browser-only global, at module load time — importing it eagerly here
// would crash TanStack Start's server render. Loading it lazily means that
// import only ever runs client-side, inside ClientOnly below.
const PowerBiLiveEmbed = lazy(() => import("./powerbi-live-embed"));

const EmbedSpinner = () => (
  <div className="py-12 flex items-center justify-center text-muted-foreground">
    <Loader2 className="size-6 animate-spin" />
  </div>
);

function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : (fallback ?? null)}</>;
}

function LiveEmbed({ config }: { config: PowerBiEmbedConfig }) {
  return (
    <ClientOnly fallback={<EmbedSpinner />}>
      <Suspense fallback={<EmbedSpinner />}>
        <PowerBiLiveEmbed config={config} />
      </Suspense>
    </ClientOnly>
  );
}

// The outer shell (title, subtitle, status badge) stays CHIETA-styled, like
// every other page in the app. Only the report content below it — the demo
// preview or the live embed — uses the actual Power BI visual language
// (see lib/powerbi-theme.ts), since that's the thing meant to look and feel
// like a real Power BI report.
export function PowerBiAnalytics() {
  const { data: config, isLoading, isError, error } = usePowerBiEmbedConfig();

  if (isLoading) return <EmbedSpinner />;

  if (isError) {
    return <div className="text-sm text-danger">{(error as Error).message}</div>;
  }

  if (!config) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display font-extrabold uppercase tracking-tight text-sm">
            {config.report_name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {config.configured
              ? "Live Power BI report"
              : "Not yet connected to Power BI — themed preview below"}
          </div>
        </div>
        <Badge tone={config.configured ? "info" : "warn"}>
          {config.configured ? "Power BI" : "Preview"}
        </Badge>
      </div>

      {config.configured && config.report_id ? (
        <div className="min-h-[70vh] rounded-[2px] overflow-hidden border border-border">
          <LiveEmbed config={config} />
        </div>
      ) : config.demo ? (
        <PowerBiReport demo={config.demo} />
      ) : null}
    </div>
  );
}
