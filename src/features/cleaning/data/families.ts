/** The families of cleaning methods, in the order the wizard works through them. */
export const methodFamilies = [
  {
    id: "profile",
    title: "1. Profiling",
    body: "Column stats, pattern shapes, functional dependencies, cross-table orphans. Measure before you change.",
  },
  {
    id: "missing",
    title: "2. Missing data",
    body: "MCAR / MAR / MNAR, deletion, single and multiple imputation, KNN, MissForest, missingness indicators.",
  },
  {
    id: "duplicates",
    title: "3. Duplicates and linkage",
    body: "Exact keys, blocking, Jaro-Winkler, Fellegi–Sunter, clustering, survivorship.",
  },
  {
    id: "outliers",
    title: "4–5. Outliers and noise",
    body: "Z, MAD, IQR, Isolation Forest, LOF, winsorise, rolling median, Savitzky–Golay, Kalman.",
  },
  {
    id: "formats",
    title: "6–8. Formats, types, categories",
    body: "ISO dates, ZA numbers, sentinels, mapping tables, fingerprint clusters, tidy reshape.",
  },
  {
    id: "validate",
    title: "9–12. Rules, constraints, sources, privacy",
    body: "Expectation suites, SA ID checksum, FD repair, MDM, residual PII, k-anonymity.",
  },
  {
    id: "method",
    title: "13–16. How the work is done",
    body: "Manual, rule, statistical, ML, constraint, LLM-assisted (always validated), preventive vs batch vs streaming, TDQM, bronze never overwritten.",
  },
] as const;
