import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Download } from "lucide-react";

export const Route = createFileRoute("/app/reports")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader title="Generate Report" subtitle="Build a branded report from any dashboard combination" />
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        <Panel title="Scheduled Reports">
          <ul className="text-sm flex flex-col gap-3">
            {[
              { name:"Weekly Executive Brief", freq:"Mon 07:00", next:"22 Jun", fmt:"PDF", recip:12 },
              { name:"Grants Quarterly", freq:"Quarterly", next:"01 Jul", fmt:"Excel", recip:8 },
              { name:"Centres Monthly", freq:"1st of month", next:"01 Jul", fmt:"PDF", recip:24 },
            ].map(r=>(
              <li key={r.name} className="p-3 rounded-md border border-border">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.freq} · next {r.next} · {r.fmt} · {r.recip} recipients</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Compose new report">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-2">Dashboards</div>
              {["Executive Cockpit","Grants","Learner","ETQA","Centres"].map(s=>(
                <label key={s} className="flex items-center gap-2 text-sm py-1.5"><input type="checkbox" defaultChecked={s==="Executive Cockpit"} className="accent-accent" /> {s}</label>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Date range</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Last quarter</option></select></label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Format</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>PDF</option><option>Excel</option><option>PNG</option></select></label>
              <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" defaultChecked className="accent-accent" /> Include AI recommendations</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-accent" /> CHIETA branded cover</label>
              <button className="mt-3 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2"><Download className="size-4"/> Generate Now</button>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Report History">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Report</th><th className="text-left">By</th><th className="text-left">Date</th><th className="text-left">Format</th><th className="text-right">Size</th><th></th></tr></thead>
          <tbody>{Array.from({length:8}).map((_,i)=>(
            <tr key={i} className="border-t border-border"><td className="py-2">Executive Brief — Week {24-i}</td><td>T. Mokoena</td><td>14 Jun 2026</td><td>PDF</td><td className="text-right">2.4 MB</td><td className="text-right"><button className="text-primary text-xs">Download</button></td></tr>
          ))}</tbody>
        </table>
      </Panel>
    </>
  );
}
