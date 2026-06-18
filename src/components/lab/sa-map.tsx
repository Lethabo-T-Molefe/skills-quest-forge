// Stylized 9-province grid map of South Africa (not geographic)
import { PROVINCES } from "@/lib/mock-data";

type Datum = { province: string; value: number };
const layout: Record<string, { col: number; row: number }> = {
  "Northern Cape": { col: 1, row: 2 },
  "Western Cape":  { col: 1, row: 3 },
  "Eastern Cape":  { col: 2, row: 3 },
  "Free State":    { col: 2, row: 2 },
  "KwaZulu-Natal": { col: 3, row: 2 },
  "North West":    { col: 2, row: 1 },
  "Gauteng":       { col: 3, row: 1 },
  "Mpumalanga":    { col: 4, row: 1 },
  "Limpopo":       { col: 3, row: 0 },
};

export function ProvinceHeatMap({ data, label = "rate" }: { data: Datum[]; label?: string }) {
  const map = Object.fromEntries(data.map(d => [d.province, d.value]));
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const tone = (v: number) => {
    const t = (v - min) / Math.max(1, max - min);
    if (t > 0.66) return "bg-success/80 text-white";
    if (t > 0.33) return "bg-accent/70 text-ink";
    return "bg-danger/70 text-white";
  };
  return (
    <div className="grid grid-cols-5 grid-rows-4 gap-2 aspect-[5/4]">
      {PROVINCES.map(p => {
        const pos = layout[p];
        const v = map[p] ?? 0;
        return (
          <div key={p}
            className={`rounded-md border border-border p-2 flex flex-col justify-between text-[10px] font-medium ${tone(v)}`}
            style={{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }}>
            <div className="opacity-90 leading-tight">{p}</div>
            <div className="font-display text-base font-bold">{v.toFixed(0)}<span className="opacity-70 text-[10px] ml-0.5">{label === "rate" ? "%" : ""}</span></div>
          </div>
        );
      })}
    </div>
  );
}
