import { layerMedia } from "@/config/media";

const layers = [
  { key: "bronze" as const, label: "Bronze", body: "Raw, immutable" },
  { key: "silver" as const, label: "Silver", body: "Cleaned, masked" },
  { key: "gold" as const, label: "Gold", body: "Ready to query" },
];

export function LayerStrip({ current }: { current?: "bronze" | "silver" | "gold" }) {
  return (
    <ol className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
      {layers.map((layer, index) => {
        const image = layerMedia[layer.key];
        const order = { bronze: 0, silver: 1, gold: 2 };
        const reached = current ? index <= order[current] : true;
        return (
          <li key={layer.key} className="bg-surface-raised">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className={`h-full w-full object-cover ${reached ? "" : "opacity-35"}`}
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">({layer.label.toLowerCase()})</p>
              <p className="mt-0.5 text-sm font-medium">{layer.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
