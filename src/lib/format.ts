import { siteConfig } from "@/config/site";

/** Formats a count with the workspace locale, e.g. 48213 → "48 213". */
export function formatNumber(value: number) {
  return value.toLocaleString(siteConfig.locale);
}
