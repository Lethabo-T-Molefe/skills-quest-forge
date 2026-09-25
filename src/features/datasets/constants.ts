import type { Classification } from "./types";

export const classificationLabel: Record<Classification, string> = {
  "restricted-personal": "Restricted · personal",
  "internal-confidential": "Internal · confidential",
  "internal-general": "Internal · general",
};

export const layerFilters = ["All", "bronze", "silver", "gold"] as const;
export type LayerFilter = (typeof layerFilters)[number];
