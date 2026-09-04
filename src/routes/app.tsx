import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LabSidebar } from "@/components/lab/sidebar";
import { LabTopbar } from "@/components/lab/topbar";
import { RoleProvider } from "@/lib/role-context";
import { getStoredSession } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getStoredSession()) {
      throw redirect({ to: "/signin" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        <LabSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <LabTopbar />
          <main className="p-6 flex-1 flex flex-col gap-6">
            <Outlet />
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
