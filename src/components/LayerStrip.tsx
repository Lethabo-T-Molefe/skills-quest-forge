const layers = [
  { key: "bronze" as const, label: "Bronze", body: "Raw, immutable", tone: "bg-[#8B6914]" },
  { key: "silver" as const, label: "Silver", body: "Cleaned, masked", tone: "bg-[#8A8F93]" },
  { key: "gold" as const, label: "Gold", body: "Ready to query", tone: "bg-[#C4A15A]" },
];

export function LayerStrip({ current }: { current?: "bronze" | "silver" | "gold" }) {
  const order = { bronze: 0, silver: 1, gold: 2 };

  return (
    <ol className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
      {layers.map((layer, index) => {
        const reached = current ? index <= order[current] : true;
        return (
          <li key={layer.key} className="bg-surface-raised p-4">
            <span
              className={`block h-1.5 w-10 ${layer.tone} ${reached ? "" : "opacity-30"}`}
              aria-hidden
            />
            <p className="mt-3 text-xs text-muted-foreground">({layer.label.toLowerCase()})</p>
            <p className="mt-0.5 text-sm font-medium">{layer.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
