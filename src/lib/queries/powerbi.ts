import { useQuery } from "@tanstack/react-query";
import { getPowerBiEmbedConfig } from "@/lib/api/powerbi";

// Power BI embed tokens are short-lived (~60 min); refetch well before that
// so a long-open tab gets a fresh one instead of erroring out mid-session.
const EMBED_TOKEN_REFRESH_MS = 30 * 60 * 1000;

export function usePowerBiEmbedConfig() {
  return useQuery({
    queryKey: ["powerbi", "embed-config"],
    queryFn: getPowerBiEmbedConfig,
    staleTime: EMBED_TOKEN_REFRESH_MS,
    refetchInterval: EMBED_TOKEN_REFRESH_MS,
  });
}
