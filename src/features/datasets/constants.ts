import type { Classification, DatasetStatus, Layer, Visibility } from "./types";

export const classificationLabel: Record<Classification, string> = {
  "restricted-personal": "Restricted · personal",
  "internal-confidential": "Internal · confidential",
  "internal-general": "Internal · general",
};

/** What each classification means for the people choosing one. */
export const classificationHint: Record<Classification, string> = {
  "restricted-personal": "Holds information about people. Personal columns are masked everywhere.",
  "internal-confidential": "Business data that should not leave the organisation.",
  "internal-general": "Fine for anyone in the organisation to see.",
};

/** Layer names with what they mean, so nobody has to remember the medallion terms. */
export const layerLabels: Record<Layer, string> = {
  bronze: "Bronze · raw",
  silver: "Silver · cleaned",
  gold: "Gold · ready",
};

export const visibilityLabel: Record<Visibility, string> = {
  private: "Only me",
  team: "My team",
  organisation: "Everyone",
};

export const statusLabel: Record<DatasetStatus, string> = {
  approved: "Approved",
  pending: "Waiting",
  rejected: "Rejected",
};

export const layerFilters = ["All", "bronze", "silver", "gold"] as const;
export type LayerFilter = (typeof layerFilters)[number];

export const statusFilters = [
  "All",
  "approved",
  "pending",
  "rejected",
] as const satisfies readonly ("All" | DatasetStatus)[];
export type StatusFilter = (typeof statusFilters)[number];
