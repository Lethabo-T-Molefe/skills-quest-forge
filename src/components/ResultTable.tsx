import { formatNumber } from "@/lib/format";
import { ScrollPane } from "./ScrollPane";

/** A value from a query or a preview. Database rows can hold nulls and booleans as well as text and numbers. */
export type TableCell = string | number | boolean | null;

function renderCell(cell: TableCell) {
  if (cell === null) return <span className="text-muted-foreground">empty</span>;
  if (typeof cell === "number") return formatNumber(cell);
  if (typeof cell === "boolean") return cell ? "true" : "false";
  return cell;
}

export function ResultTable({ columns, rows }: { columns: string[]; rows: TableCell[][] }) {
  return (
    <ScrollPane className="border border-border" orientation="horizontal">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
            {columns.map((col) => (
              <th key={col} scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">
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
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollPane>
  );
}
