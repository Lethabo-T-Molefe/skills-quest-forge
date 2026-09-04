// The *actual* Power BI visual language — deliberately not the CHIETA brand
// tokens in styles.css (purple/gold, thick "sw-card" borders, Roboto). Scoped
// to the Power BI Analytics report content only; every other page in the app
// keeps using the CHIETA theme untouched.

// Power BI's default "Colorful" categorical palette (Report Themes gallery).
export const PBI_COLORS = [
  "#01B8AA", "#374649", "#FD625E", "#F2C80F",
  "#5F6B6D", "#8AD4EB", "#FE9666", "#A66999",
];

export const PBI_FONT =
  "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif";

export const PBI_TEXT = "#252423";
export const PBI_SUBTEXT = "#605E5C";
export const PBI_BORDER = "#E1DFDD";
export const PBI_CANVAS_BG = "#F3F2F1";

// Report Builder theme picker — a handful of curated categorical palettes
// (real Power BI "Report themes" gallery entries) plus the CHIETA-branded
// default above. Reports store just the chosen `colors` array
// (domain.entities.powerbi.PowerBiReport.theme); falls back to PBI_COLORS
// when a report has none set.
export const PRESET_THEMES: { name: string; colors: string[] }[] = [
  { name: "CHIETA Skills Analytics", colors: PBI_COLORS },
  { name: "Colorful (classic)", colors: ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#D64550"] },
  { name: "City Park", colors: ["#374649", "#00B2CA", "#7DD5C0", "#F2C57C", "#8964A6", "#63A375", "#EF6461", "#2C6E49"] },
  { name: "Executive", colors: ["#0F1B2D", "#2E5077", "#4DA1A9", "#79D7BE", "#F6F6F6", "#D95F5F", "#C89B3C", "#6B4226"] },
];

// A real Power BI custom theme JSON (Report > View > Customize current theme
// > ... > Export theme schema). Applied to the demo preview's own chart
// styling here, and handed to the live embed's report.applyTheme() once a
// real Azure/Power BI connection exists — same look either way.
export const PBI_THEME_JSON = {
  name: "CHIETA Skills Analytics",
  dataColors: PBI_COLORS,
  background: "#FFFFFF",
  foreground: PBI_TEXT,
  tableAccent: PBI_COLORS[0],
};
