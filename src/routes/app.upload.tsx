import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CheckCircle2, UploadCloud, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/upload")({ component: Page });

const steps = ["File Upload", "Metadata", "Profiling Preview"];

function Page() {
  const [step, setStep] = useState(0);
  return (
    <>
      <PageHeader title="Upload Dataset" subtitle="Submit a new dataset for steward approval" />

      <Panel title={`Step ${step + 1} of 3 — ${steps[step]}`}>
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`size-7 rounded-full grid place-items-center text-xs font-bold border ${i <= step ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground"}`}>{i + 1}</div>
              <div className={`flex-1 text-xs ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</div>
              {i < steps.length - 1 && <div className="h-px bg-border flex-1" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/30">
            <UploadCloud className="size-10 mx-auto text-muted-foreground" />
            <div className="mt-3 font-display font-semibold">Drop your CSV or Excel file here</div>
            <div className="text-xs text-muted-foreground mt-1">Max 500 MB · virus-scanned · stored in Raw Zone</div>
            <button onClick={() => setStep(1)} className="mt-5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Browse files</button>
            <div className="mt-6 text-xs text-success flex items-center justify-center gap-1.5"><CheckCircle2 className="size-3.5" /> Q3_Grants_Master.csv · 12.4 MB · scanned clean</div>
          </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Dataset name</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" defaultValue="Q3_Grants_Master" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Source unit</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Grants</option><option>ETQA</option><option>Learner Records</option><option>Skills Centres</option><option>Labour Market</option></select></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Classification</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>INTERNAL–Confidential</option><option>RESTRICTED–Personal</option><option>INTERNAL–General</option></select></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Contains personal IDs?</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>No</option><option>Yes</option></select></label>
            <label className="md:col-span-2 flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Sensitive fields</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" placeholder="id_number, full_name" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Requested by</span><input disabled value="T. Mokoena" className="bg-muted/60 border border-border rounded-md h-9 px-3 text-sm" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Owner approval</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" placeholder="Approver name" /></label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-4 gap-3">
              {[["Rows", "1,248"], ["Columns", "28"], ["Null %", "2.3%"], ["Duplicates", "0"]].map(([k,v]) => (
                <div key={k} className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground">{k}</div><div className="text-xl font-display font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-medium text-sm mb-2">Sample (sensitive fields masked)</div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted"><tr>{"grant_id|provider|province|allocated|spent".split("|").map(h => <th key={h} className="text-left p-2 font-medium">{h}</th>)}</tr></thead>
                  <tbody>{Array.from({length:5}).map((_,i)=>(<tr key={i} className="border-t border-border"><td className="p-2">DG-2026-{1000+i}</td><td className="p-2">Skills Co.</td><td className="p-2">Gauteng</td><td className="p-2">R 500 000</td><td className="p-2">R 412 880</td></tr>))}</tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="font-medium text-sm mb-2">Validation rules</div>
              <ul className="text-xs flex flex-col gap-1.5">
                {["Schema matches Grants v3", "Provincial codes valid", "Spend ≤ allocated", "No PII in unmasked columns", "Duplicate IDs check"].map((r, i) => (
                  <li key={r} className="flex items-center gap-2"><CheckCircle2 className={`size-3.5 ${i === 3 ? "text-danger" : "text-success"}`} /> {r} <Badge tone={i === 3 ? "danger" : "success"}>{i === 3 ? "Failed" : "Passed"}</Badge></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          <button disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))} className="text-sm px-3 py-2 rounded-md border border-border disabled:opacity-40">Back</button>
          <button onClick={() => setStep(s => Math.min(2, s+1))} className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2">
            <FileSpreadsheet className="size-4" /> {step === 2 ? "Submit for Steward Approval" : "Continue"}
          </button>
        </div>
      </Panel>
    </>
  );
}
