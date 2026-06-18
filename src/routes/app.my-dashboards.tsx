import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Star } from "lucide-react";
export const Route = createFileRoute("/app/my-dashboards")({ component: Page });
function Page() {
  const dash = ["My Grants Watchlist","Province Deep-Dive: KZN","Provider Risk Tracker","Apprenticeship Pipeline"];
  return (<><PageHeader title="My Dashboards" subtitle="Personal saved views" actions={<button className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground">+ New</button>} />
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dash.map(d=>(
        <Panel key={d} title={d} subtitle="Last edited 2 days ago" action={<Star className="size-4 text-accent fill-accent" />}>
          <div className="aspect-video rounded-md bg-gradient-to-br from-primary/20 to-accent/10 border border-border" />
        </Panel>
      ))}
    </div></>);
}
