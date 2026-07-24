export function DataTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  if (columns.length === 0) {
    return <div className="text-sm text-muted-foreground py-8 text-center">No rows.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs font-mono">
        <thead className="bg-muted">
          <tr>{columns.map((c) => <th key={c} className="text-left p-2 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} className="border-t border-border odd:bg-muted/30">
              {row.map((cell, j) => (
                <td key={j} className="p-2">{cell === null || cell === undefined ? "—" : String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
