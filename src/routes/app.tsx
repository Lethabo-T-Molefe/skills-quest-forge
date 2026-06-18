import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LabSidebar } from "@/components/lab/sidebar";
import { LabTopbar } from "@/components/lab/topbar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <LabSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <LabTopbar />
        <main className="p-6 flex-1 flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
