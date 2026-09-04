import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Loader2, LayoutDashboard, FolderKanban } from "lucide-react";
import { Badge } from "./panel";
import { PowerBiReport } from "./powerbi-report";
import { PowerBiBuilder } from "./powerbi-builder";
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

// The outer shell (title, subtitle, status badge, the section tab strip)
// stays CHIETA-styled, like every other page in the app. Only the report
// content below it — the demo/live report or the Report Builder — uses the
// actual Power BI visual language (see lib/powerbi-theme.ts), since that's
// the thing meant to look and feel like a real Power BI report.
export function PowerBiAnalytics() {
  const { data: config, isLoading, isError, error } = usePowerBiEmbedConfig();
  const [section, setSection] = useState<"analytics" | "builder">("analytics");

  if (isLoading) return <EmbedSpinner />;

  if (isError) {
    return <div className="text-sm text-danger">{(error as Error).message}</div>;
  }

  if (!config) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-full border border-border bg-muted/40 w-fit">
          <button
            onClick={() => setSection("analytics")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${section === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <LayoutDashboard className="size-3.5" /> {config.report_name}
          </button>
          <button
            onClick={() => setSection("builder")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${section === "builder" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <FolderKanban className="size-3.5" /> My Reports
          </button>
        </div>
        {section === "analytics" && (
          <Badge tone={config.configured ? "info" : "warn"}>
            {config.configured ? "Power BI" : "Preview"}
          </Badge>
        )}
      </div>

      {section === "builder" ? (
        <PowerBiBuilder />
      ) : config.configured && config.report_id ? (
        <div className="min-h-[70vh] rounded-[2px] overflow-hidden border border-border">
          <LiveEmbed config={config} />
        </div>
      ) : config.demo ? (
        <PowerBiReport demo={config.demo} />
      ) : null}
    </div>
  );
}
