import { Link } from "@tanstack/react-router";
import { BarChart3, Code2, Compass, MessageSquareText, Target } from "lucide-react";
import { getMethod } from "../data/methods";
import { useQuery } from "@tanstack/react-query";
import { analysisCatalogueQuery } from "../api/analysis";
import type { AnalyseSearch } from "../search";

const tabClass =
  "inline-flex items-center gap-1.5 rounded-[999px] px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";
const activeClass = "bg-surface-raised text-foreground shadow-sm";

/**
 * The ways of working inside Analyse. Every tab carries the chosen dataset and method,
 * so switching from asking to building to code keeps the same question in hand.
 */
export function AnalyseTabs({ context }: { context: AnalyseSearch }) {
  const search = {
    ...(context.dataset ? { dataset: context.dataset } : {}),
    ...(context.method ? { method: context.method } : {}),
  };
  // Predict is guided and has no builder, SQL or chat equivalent, so its method is not carried into those tabs.
  const toolSearch = context.method === "predict" ? { ...search, method: undefined } : search;
  const catalogue = useQuery(analysisCatalogueQuery());
  const dataset = catalogue.data?.datasets.find((item) => item.id === context.dataset);
  const method = getMethod(context.method);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Ways to analyse"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-[999px] bg-surface-alt p-1"
      >
        <Link
          to="/analyse"
          search={search}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: activeClass }}
          className={tabClass}
        >
          <Compass className="size-4" strokeWidth={1.5} aria-hidden />
          Choose
        </Link>
        <Link
          to="/analyse/ask"
          search={toolSearch}
          activeOptions={{ includeSearch: false }}
          activeProps={{ className: activeClass }}
          className={tabClass}
        >
          <MessageSquareText className="size-4" strokeWidth={1.5} aria-hidden />
          Ask
        </Link>
        <Link
          to="/analyse/build"
          search={toolSearch}
          activeOptions={{ includeSearch: false }}
          activeProps={{ className: activeClass }}
          className={tabClass}
        >
          <BarChart3 className="size-4" strokeWidth={1.5} aria-hidden />
          Build a chart
        </Link>
        <Link
          to="/analyse/code"
          search={toolSearch}
          activeOptions={{ includeSearch: false }}
          activeProps={{ className: activeClass }}
          className={tabClass}
        >
          <Code2 className="size-4" strokeWidth={1.5} aria-hidden />
          Write SQL
        </Link>
        <Link
          to="/analyse/predict"
          search={search}
          activeOptions={{ includeSearch: false }}
          activeProps={{ className: activeClass }}
          className={tabClass}
        >
          <Target className="size-4" strokeWidth={1.5} aria-hidden />
          Predict
        </Link>
      </nav>
      {dataset || method ? (
        <p className="text-sm text-muted-foreground">
          {dataset ? <span className="font-medium text-foreground">{dataset.name}</span> : null}
          {dataset && method ? " · " : null}
          {method ? method.name : null}
        </p>
      ) : null}
    </div>
  );
}
