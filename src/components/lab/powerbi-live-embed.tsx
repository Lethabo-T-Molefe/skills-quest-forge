import { models, type Report } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";
import type { PowerBiEmbedConfig } from "@/lib/api/powerbi";
import { PBI_THEME_JSON } from "@/lib/powerbi-theme";

// Isolated in its own module (default export, loaded via React.lazy from
// powerbi-embed.tsx) so its top-level `powerbi-client` import — which
// references `self`, a browser-only global — never executes during SSR.
// Only rendered client-side, after the embed session is actually configured.
export default function PowerBiLiveEmbed({ config }: { config: PowerBiEmbedConfig }) {
  return (
    <PowerBIEmbed
      embedConfig={{
        type: "report",
        id: config.report_id!,
        embedUrl: config.embed_url!,
        accessToken: config.access_token!,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: { filters: { expanded: false, visible: true } },
          background: models.BackgroundType.Transparent,
        },
      }}
      // Same custom theme as the demo preview (lib/powerbi-theme.ts), so the
      // report looks consistent whether it's the mock or the live embed.
      getEmbeddedComponent={(embed) => {
        void (embed as Report).applyTheme({ themeJson: PBI_THEME_JSON });
      }}
      cssClassName="w-full h-[70vh] rounded-lg overflow-hidden"
    />
  );
}
