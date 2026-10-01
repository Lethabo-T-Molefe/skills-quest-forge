import { Notice, ResultTable } from "@/components";
import { formatNumber } from "@/lib/format";
import type { QueryResult } from "../types";

/** A query's outcome: the rows, or the sandbox's reason for refusing it. */
export function QueryResultView({ result }: { result: QueryResult }) {
  if (result.refused) {
    return (
      <Notice tone="signal" title="The sandbox refused this query">
        {result.explanation}
      </Notice>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm">{result.explanation}</p>
      {result.rows.length > 0 ? (
        <ResultTable columns={result.columns} rows={result.rows} />
      ) : (
        <p className="text-sm text-muted-foreground">The query ran and returned no rows.</p>
      )}
      <p className="num text-xs text-muted-foreground">
        {formatNumber(result.rows.length)} {result.rows.length === 1 ? "row" : "rows"}
        {result.durationMs !== undefined ? ` in ${formatNumber(result.durationMs)} ms` : ""}
        {result.truncated ? ". The result was cut at the row limit; add a LIMIT or a filter." : ""}
      </p>
    </div>
  );
}
