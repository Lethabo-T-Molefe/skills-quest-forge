import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/playground")({
  component: PlaygroundLayout,
});

/** Layout shell for /app/playground and its tool embed children. */
function PlaygroundLayout() {
  return <Outlet />;
}
