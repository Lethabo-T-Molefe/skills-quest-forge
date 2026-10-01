import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { Notice } from "@/components";
import { errorMessage } from "@/lib/api";
import { supersetGuestToken } from "../api/integrations";

/**
 * A Superset dashboard embedded in DataForge. The guest token comes from DataForge, carries the viewer's row
 * policies, and is refreshed by the SDK before it expires.
 */
export function SupersetEmbed({ dashboardId, title }: { dashboardId: number; title: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const node = mount.current;
    if (!node) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;

    (async () => {
      try {
        const first = await supersetGuestToken(dashboardId);
        if (cancelled) return;
        const embedded = await embedDashboard({
          id: first.embeddedId,
          supersetDomain: first.supersetDomain,
          mountPoint: node,
          fetchGuestToken: async () => (await supersetGuestToken(dashboardId)).token,
          dashboardUiConfig: { hideTitle: true, filters: { expanded: false } },
          iframeTitle: title,
        });
        unmount = embedded.unmount;
        if (cancelled) embedded.unmount();
      } catch (caught) {
        if (!cancelled) setError(errorMessage(caught, "Superset could not load this dashboard."));
      }
    })();

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [dashboardId, title]);

  if (error) {
    return (
      <Notice tone="signal" title="The dashboard did not load">
        {error}
      </Notice>
    );
  }
  // The SDK inserts an iframe; this sizes it to a comfortable reading height.
  return (
    <div
      ref={mount}
      className="h-[70vh] min-h-[32rem] w-full border border-border bg-surface-raised [&>iframe]:size-full [&>iframe]:border-0"
    />
  );
}
