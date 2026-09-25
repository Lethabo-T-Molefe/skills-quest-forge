import { formatNumber } from "@/lib/format";
import { ScrollPane } from "./ScrollPane";

export function ResultTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <ScrollPane className="border border-border" orientation="horizontal">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="num">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={`${i}-${j}`} className="px-4 py-2.5">
                  {typeof cell === "number" ? formatNumber(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollPane>
  );
}
