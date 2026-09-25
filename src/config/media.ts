export const media = {
  hero: {
    src: "/images/hero-plot.png",
    alt: "A printed scatter plot on ivory paper, with a brass stamp and a vermilion ink pad",
  },
  waiting: {
    src: "/images/waiting-charts.png",
    alt: "A stack of printed charts on a dark desk, one dip circled in vermilion",
  },
  raw: {
    src: "/images/raw-figures.png",
    alt: "A worn ledger of handwritten numbers with crossed-out rows and a coffee ring",
  },
  cleaned: {
    src: "/images/cleaned-tables.png",
    alt: "A neatly printed data table and a clean line chart aligned with a steel ruler",
  },
  plates: {
    src: "/images/gold-plates.png",
    alt: "Three metal plates stacked bronze, silver and gold",
  },
  masked: {
    src: "/images/masked-table.png",
    alt: "A printed data table with charcoal redaction bars over personal columns",
  },
  sandbox: {
    src: "/images/glass-sandbox.png",
    alt: "A glass box isolating a notebook and pencil on a desk",
  },
  audit: {
    src: "/images/audit-book.png",
    alt: "An open cloth-bound account book with a vermilion mark",
  },
  empty: {
    src: "/images/empty-desk.png",
    alt: "An empty ivory desk with a pencil and a blank card",
  },
  contact: {
    src: "/images/contact-seal.png",
    alt: "A fountain pen and a vermilion wax seal on paper",
  },
  hands: {
    src: "/images/hands-charts.png",
    alt: "Hands aligning a ruler across printed charts on an ivory desk",
  },
  plot: {
    src: "/images/printed-scatter.png",
    alt: "Printed scatter and bar charts on ivory paper, one cluster marked in vermilion",
  },
} as const;

export const layerMedia = {
  bronze: media.raw,
  silver: media.cleaned,
  gold: media.plates,
} as const;
