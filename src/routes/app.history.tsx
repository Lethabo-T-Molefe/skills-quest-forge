import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
export const Route = createFileRoute("/app/history")({ component: Page });
function Page() {
  return (<><PageHeader title="Report History" />
    <Panel title="All generated reports">
      <table className="w-full text-sm"><thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Report</th><th>By</th><th>Date</th><th>Format</th><th>Size</th><th></th></tr></thead>
      <tbody>{Array.from({length:14}).map((_,i)=>(<tr key={i} className="border-t border-border"><td className="py-2">Executive Brief — Week {24-i}</td><td>T. Mokoena</td><td>{14-i} Jun 2026</td><td>PDF</td><td>2.{i} MB</td><td><button className="text-primary text-xs">Download</button></td></tr>))}</tbody></table>
    </Panel></>);
}
