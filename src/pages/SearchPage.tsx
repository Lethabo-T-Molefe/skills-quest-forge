import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Chip, EmptyState, SearchField } from "@/components";
import { searchCatalogue } from "@/features/search";
import { MainLayout } from "@/layouts/MainLayout";

export function SearchPage() {
  const { q } = useSearch({ from: "/search" });
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const hits = searchCatalogue(q);

  return (
    <MainLayout
      title={q ? `Results for “${q}”` : "Search"}
      description="Find datasets, shared metrics, dashboards and members in one place."
    >
      <SearchField
        className="mb-6 max-w-xl"
        value={query}
        onChange={setQuery}
        placeholder="Search datasets, metrics and dashboards"
        onSubmit={() => void navigate({ to: "/search", search: { q: query } })}
      />
      {hits.length === 0 ? (
        <EmptyState
          title={q ? "Nothing matched" : "Search the catalogue"}
          body="Try a dataset name, a metric such as active learners, or a member."
        />
      ) : (
        <ul className="divide-y divide-border border border-border bg-surface-raised">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              {hit.kind === "dataset" ? (
                <Link
                  to="/datasets/$datasetId"
                  params={{ datasetId: hit.params?.["datasetId"] ?? hit.id }}
                  className="flex items-start justify-between gap-4 p-5 hover:bg-surface-alt"
                >
                  <HitCopy title={hit.title} detail={hit.detail} kind={hit.kind} />
                </Link>
              ) : hit.kind === "dashboard" ? (
                <Link
                  to="/dashboards/$dashboardId"
                  params={{ dashboardId: hit.params?.["dashboardId"] ?? hit.id }}
                  className="flex items-start justify-between gap-4 p-5 hover:bg-surface-alt"
                >
                  <HitCopy title={hit.title} detail={hit.detail} kind={hit.kind} />
                </Link>
              ) : hit.kind === "metric" ? (
                <Link to="/semantic" className="flex items-start justify-between gap-4 p-5 hover:bg-surface-alt">
                  <HitCopy title={hit.title} detail={hit.detail} kind={hit.kind} />
                </Link>
              ) : (
                <Link to="/admin" className="flex items-start justify-between gap-4 p-5 hover:bg-surface-alt">
                  <HitCopy title={hit.title} detail={hit.detail} kind={hit.kind} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

function HitCopy({ title, detail, kind }: { title: string; detail: string; kind: string }) {
  return (
    <>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
      <Chip>{kind}</Chip>
    </>
  );
}
