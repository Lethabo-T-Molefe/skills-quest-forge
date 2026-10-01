import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Chip, EmptyState, Notice, SearchField } from "@/components";
import { searchQuery, type SearchHit } from "@/features/search";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";

const kindLabel: Record<SearchHit["type"], string> = {
  dataset: "Dataset",
  metric: "Metric",
  dashboard: "Dashboard",
  notebook: "Notebook",
};

const rowClass = "flex items-start justify-between gap-4 p-5 hover:bg-surface-alt";

/** Each kind of hit opens on its own screen. */
function HitLink({ hit, children }: { hit: SearchHit; children: ReactNode }) {
  switch (hit.type) {
    case "dataset":
      return (
        <Link to="/datasets/$datasetId" params={{ datasetId: hit.id }} className={rowClass}>
          {children}
        </Link>
      );
    case "dashboard":
      return (
        <Link to="/dashboards/$dashboardId" params={{ dashboardId: hit.id }} className={rowClass}>
          {children}
        </Link>
      );
    case "notebook":
      return (
        <Link to="/analyse/code" search={{ notebook: hit.id }} className={rowClass}>
          {children}
        </Link>
      );
    default:
      return (
        <Link to="/semantic" hash={hit.id} className={rowClass}>
          {children}
        </Link>
      );
  }
}

export function SearchPage() {
  const { q } = useSearch({ from: "/search" });
  const navigate = useNavigate();
  // What is being typed, kept with the search it belongs to: a new search from the top bar resets the box.
  const [draft, setDraft] = useState({ for: q, text: q });
  const query = draft.for === q ? draft.text : q;
  const setQuery = (text: string) => setDraft({ for: q, text });
  const hits = useQuery(searchQuery(q));

  return (
    <MainLayout
      title={q ? `Results for “${q}”` : "Search"}
      description="Find datasets, shared metrics, dashboards and notebooks in one place. You only see what your role and sharing allow."
    >
      <SearchField
        className="mb-6 max-w-xl"
        value={query}
        onChange={setQuery}
        placeholder="Search datasets, metrics and dashboards"
        onSubmit={() => void navigate({ to: "/search", search: { q: query.trim() } })}
      />
      {!q ? (
        <EmptyState
          title="Search the catalogue"
          body="Try a dataset name, a column such as region, or a metric such as completion rate."
        />
      ) : hits.isPending ? (
        <p className="text-sm text-muted-foreground" role="status">
          Searching…
        </p>
      ) : hits.isError ? (
        <Notice tone="signal" title="The search did not run">
          {errorMessage(hits.error)}
        </Notice>
      ) : hits.data.length === 0 ? (
        <EmptyState
          title="Nothing matched"
          body="Check the spelling, or try a shorter word. Search covers names, descriptions and column names."
        />
      ) : (
        <>
          <p className="num mb-3 text-xs text-muted-foreground" aria-live="polite">
            {hits.data.length} {hits.data.length === 1 ? "result" : "results"}
          </p>
          <ul className="divide-y divide-border border border-border bg-surface-raised">
            {hits.data.map((hit) => (
              <li key={`${hit.type}-${hit.id}`}>
                <HitLink hit={hit}>
                  <span className="min-w-0">
                    <span className="block font-medium">{hit.title}</span>
                    <span className="mt-1 block text-sm break-words text-muted-foreground">
                      {hit.detail}
                    </span>
                  </span>
                  <Chip>{kindLabel[hit.type]}</Chip>
                </HitLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </MainLayout>
  );
}
