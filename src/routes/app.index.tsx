import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/lab/role-dashboards";

export const Route = createFileRoute("/app/")({
  component: RoleDashboard,
});
