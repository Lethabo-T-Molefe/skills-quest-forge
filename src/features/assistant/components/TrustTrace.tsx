import { CircleCheck, CircleSlash, Info } from "lucide-react";
import { CodeBlock } from "@/components";
import type { TraceStep } from "../types";

function evidence(step: TraceStep): { label: string; value: string }[] {
  const data = step.data ?? {};
  const out: { label: string; value: string }[] = [];
  if (step.key === "planner") {
    if (typeof data["model"] === "string") out.push({ label: "Model", value: data["model"] });
    if (typeof data["planner"] === "string")
      out.push({
        label: "Planner",
        value: data["planner"] === "model" ? "Language model" : "Rules",
      });
  }
  if (step.key === "sandbox" && typeof data["sessionId"] === "string") {
    out.push({ label: "Sandbox session", value: data["sessionId"] });
  }
  if (step.key === "audit" && typeof data["eventId"] === "string") {
    out.push({ label: "Audit event", value: `#${data["eventId"]}` });
  }
  if (step.key === "privacy" && Array.isArray(data["masked"]) && data["masked"].length > 0) {
    out.push({ label: "Masked columns", value: (data["masked"] as string[]).join(", ") });
  }
  return out;
}

const icons = {
  passed: <CircleCheck className="size-4 text-success" strokeWidth={1.75} aria-hidden />,
  blocked: <CircleSlash className="size-4 text-destructive" strokeWidth={1.75} aria-hidden />,
  info: <Info className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />,
};

const statusWords = { passed: "passed", blocked: "stopped here", info: "note" };

/**
 * How one answer was governed: each check it passed, the plan, the SQL, the sandbox run and the audit entry.
 * A refusal ends at the step that stopped it. Every id shown can be found in the audit trail.
 */
export function TrustTrace({ steps }: { steps: TraceStep[] }) {
  if (steps.length === 0) return null;
  const blocked = steps.find((step) => step.status === "blocked");
  return (
    <details className="group mt-3 border border-border">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none">
        <span className="underline-offset-4 group-hover:underline">
          How this answer was governed
        </span>
        <span className="ml-2 font-normal text-muted-foreground">
          {blocked
            ? `stopped at: ${blocked.label.toLowerCase()}`
            : `${steps.length} steps, all passed`}
        </span>
      </summary>
      <ol className="space-y-3 border-t border-border px-3 py-3">
        {steps.map((step, index) => {
          const items = evidence(step);
          const plan = step.key === "plan" ? step.data?.["plan"] : undefined;
          const sql = step.key === "sql" ? step.data?.["sql"] : undefined;
          return (
            <li
              key={`${step.key}-${index}`}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2"
            >
              <span className="mt-0.5">{icons[step.status]}</span>
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="sr-only">: {statusWords[step.status]}</span>
                </p>
                {step.detail ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                ) : null}
                {items.length > 0 ? (
                  <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                    {items.map((item) => (
                      <div key={item.label} className="flex gap-1">
                        <dt className="text-muted-foreground">{item.label}:</dt>
                        <dd className="num break-all">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {plan ? (
                  <div className="mt-1">
                    <CodeBlock code={JSON.stringify(plan, null, 2)} label="The plan" />
                  </div>
                ) : null}
                {typeof sql === "string" && sql ? (
                  <div className="mt-1">
                    <CodeBlock code={sql} />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
