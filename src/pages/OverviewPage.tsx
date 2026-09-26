import { Link } from "@tanstack/react-router";
import { Sparkles, Upload, Wand2 } from "lucide-react";
import { LayerStrip, quietButtonClass, signalButtonClass } from "@/components";
import { useCurrentUser } from "@/features/auth";
import { RecentActivityPanel } from "@/features/audit";
import { RecentDatasetsPanel } from "@/features/datasets";
import { MetricTiles } from "@/features/metrics";
import { AlertsPanel } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function OverviewPage() {
  const currentUser = useCurrentUser();

  return (
    <MainLayout
      label="your workspace"
      title={`Good afternoon, ${currentUser.name.split(" ")[0]}.`}
      intro="Everything you run here is sandboxed, permission-checked and written to the audit trail. Start with a file, a question or a dataset someone has already cleaned."
      actions={
        <>
          <Link to="/datasets/upload" className={signalButtonClass}>
            <Upload className="size-4" strokeWidth={1.75} />
            Upload data
          </Link>
          <Link to="/clean" className={quietButtonClass}>
            <Wand2 className="size-4" strokeWidth={1.5} />
            Clean data
          </Link>
          <Link to="/assistant" className={quietButtonClass}>
            <Sparkles className="size-4" strokeWidth={1.5} />
            Ask a question
          </Link>
        </>
      }
    >
      <LayerStrip />

      <div className="mt-10">
        <MetricTiles />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <RecentDatasetsPanel />

        <div className="flex flex-col gap-6">
          <AlertsPanel />
          <RecentActivityPanel />
        </div>
      </div>
    </MainLayout>
  );
}
