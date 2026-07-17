import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "./panel";
import type { PlaygroundService } from "@/lib/api";

// Embeds a service (Superset) inline via iframe, with a loading state and an
// "open in new tab" fallback for browsers/users that block third-party frames.
export function ServiceEmbed({
  service, isLive, path = "", height = "640px",
}: {
  service: PlaygroundService;
  isLive: boolean;
  path?: string;
  height?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = `${service.url}${path}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge tone={isLive ? "success" : "muted"}>{isLive ? "Connected" : "Default URL"}</Badge>
          <span className="text-xs text-muted-foreground font-mono">{src}</span>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5"
        >
          Open in new tab <ExternalLink className="size-3.5" />
        </a>
      </div>
      <div className="relative rounded-lg border border-border overflow-hidden" style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-muted text-sm text-muted-foreground">
            Loading {service.label}…
          </div>
        )}
        <iframe
          title={service.label}
          src={src}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
