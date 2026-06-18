import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { grantRecords } from "@/lib/mock-data";

export const Route = createFileRoute("/app/explorer")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader title="Data Explorer" subtitle="Visual table browser · mart.grant_utilisation" />
      <Panel title="Sample rows" subtitle={`${grantRecords.length} rows shown · pagination 20/page`}>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs font-mono">
            <thead className="bg-muted"><tr>{Object.keys(grantRecords[0]).map(k=>(<th key={k} className="text-left p-2 font-semibold">{k}</th>))}</tr></thead>
            <tbody>{grantRecords.slice(0,12).map(r=>(<tr key={r.id} className="border-t border-border odd:bg-muted/30"><td className="p-2">{r.id}</td><td className="p-2">{r.provider}</td><td className="p-2">{r.province}</td><td className="p-2">{r.programme}</td><td className="p-2">R {r.allocated.toLocaleString()}</td><td className="p-2">R {r.spent.toLocaleString()}</td><td className="p-2">{r.risk}</td><td className="p-2">{r.status}</td></tr>))}</tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
