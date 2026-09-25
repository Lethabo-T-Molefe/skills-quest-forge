import { siteConfig } from "@/config/site";

/**
 * DataForge brand marks, cut from the brand sheet into public/brand.
 * - primary: stacked lockup, for roomy brand moments (auth screens, footer)
 * - secondary: horizontal lockup, for navigation bars
 * - submark: circular badge, for compact spots where the full lockup won't fit
 * Use tone="reverse" on charcoal surfaces; it swaps the charcoal ink for ivory.
 */
const variants = {
  primary: { file: "logo-primary", width: 586, height: 471 },
  secondary: { file: "logo-secondary", width: 518, height: 180 },
  submark: { file: "logo-submark", width: 279, height: 283 },
} as const;

export type LogoVariant = keyof typeof variants;

export function Logo({
  variant,
  tone = "default",
  className = "",
}: {
  variant: LogoVariant;
  tone?: "default" | "reverse";
  className?: string;
}) {
  const { file, width, height } = variants[variant];
  return (
    <img
      src={`/brand/${file}${tone === "reverse" ? "-reverse" : ""}.png`}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={`h-auto ${className}`}
    />
  );
}
