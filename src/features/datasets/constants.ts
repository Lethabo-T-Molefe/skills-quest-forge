import type { Classification, DatasetStatus, Layer } from "./types";

export const classificationLabel: Record<Classification, string> = {
  "restricted-personal": "Restricted · personal",
  "internal-confidential": "Internal · confidential",
  "internal-general": "Internal · general",
};

/** Layer names with what they mean, so nobody has to remember the medallion terms. */
export const layerLabels: Record<Layer, string> = {
  bronze: "Bronze · raw",
  silver: "Silver · cleaned",
  gold: "Gold · ready",
};

export const layerFilters = ["All", "bronze", "silver", "gold"] as const;
export type LayerFilter = (typeof layerFilters)[number];

export const statusFilters = ["All", "approved", "pending"] as const satisfies readonly ("All" | DatasetStatus)[];
export type StatusFilter = (typeof statusFilters)[number];
