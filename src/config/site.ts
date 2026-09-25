export const siteConfig = {
  name: "DataForge",
  tagline: "governed analytics",
  description: "DataForge is a governed analytics platform that lets any member of an organisation do real data work.",
  locale: "en-ZA",
} as const;

/** Builds a page title in the form "Page — DataForge". */
export function pageTitle(page: string) {
  return `${page} — ${siteConfig.name}`;
}
