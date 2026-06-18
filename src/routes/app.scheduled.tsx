import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
export const Route = createFileRoute("/app/scheduled")({ component: Page });
function Page() {
  return (<><PageHeader title="Scheduled Reports" subtitle="Recurring report subscriptions" />
    <Panel title="Active schedules">
      <table className="w-full text-sm"><thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Report</th><th>Frequency</th><th>Next run</th><th>Recipients</th><th>Format</th></tr></thead>
      <tbody>{[
        ["Executive Brief","Weekly","22 Jun 07:00","12","PDF"],
        ["Grants Quarterly","Quarterly","01 Jul 06:00","8","Excel"],
        ["Centres Monthly","Monthly","01 Jul 06:00","24","PDF"],
        ["Risk Digest","Daily","19 Jun 06:00","6","PDF"],
      ].map(r=>(<tr key={r[0]} className="border-t border-border"><td className="py-2">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>))}</tbody></table>
    </Panel></>);
}
