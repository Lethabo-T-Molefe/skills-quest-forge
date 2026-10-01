import { TriangleAlert } from "lucide-react";
import type { AnalysisMethod } from "../types";

/** What a method answers, the techniques you can choose between, and what to watch for. */
export function MethodGuide({
  method,
  compact = false,
}: {
  method: AnalysisMethod;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="text-sm">{method.description}</p>
      <h3 className="font-sans mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Techniques you can choose
      </h3>
      <dl className={compact ? "mt-2 space-y-2" : "mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2"}>
        {method.techniques.map((technique) => (
          <div key={technique.name}>
            <dt className="text-sm font-medium">{technique.name}</dt>
            <dd className="text-xs text-muted-foreground">{technique.plain}</dd>
          </div>
        ))}
      </dl>
      <h3 className="font-sans mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Watch out for
      </h3>
      <ul className="mt-2 space-y-1.5">
        {method.cautions.map((caution) => (
          <li key={caution} className="flex gap-2 text-xs text-muted-foreground">
            <TriangleAlert
              className="mt-px size-3.5 shrink-0 text-warning"
              strokeWidth={1.75}
              aria-hidden
            />
            {caution}
          </li>
        ))}
      </ul>
    </div>
  );
}
