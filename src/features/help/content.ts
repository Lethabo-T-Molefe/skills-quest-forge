export interface HelpTopic {
  title: string;
  body: string;
}

export const pageHelp: Record<string, HelpTopic[]> = {
  "/workspace": [
    {
      title: "Your workspace",
      body: "This is your personal landing place. Metric tiles use shared definitions from the semantic layer, so the numbers match dashboards and the assistant.",
    },
    {
      title: "Start with a file or a question",
      body: "Upload a CSV to land it in bronze, or ask the assistant in plain English. Both paths are permission-checked and written to the audit trail.",
    },
  ],
  "/datasets": [
    {
      title: "Medallion layers",
      body: "Bronze is raw and immutable. Silver is cleaned, typed, masked and deduplicated. Gold is analytics-ready and grounded in shared metrics.",
    },
    {
      title: "Nothing is queryable until approved",
      body: "A Steward must approve a dataset before it can be used in the explorer, dashboards or the assistant.",
    },
  ],
  "/assistant": [
    {
      title: "Grounded answers only",
      body: "The assistant answers against defined metrics and data you are allowed to see. If it cannot ground a request, it refuses rather than guessing.",
    },
    {
      title: "Progressive disclosure",
      body: "Every answer includes the SQL it ran. Open that SQL in the workbench to take it further without starting again.",
    },
  ],
  "/explorer": [
    {
      title: "Point and click, then open the code",
      body: "Pick a dataset, fields and a chart. The explorer generates SQL behind the scene so an expert can edit the same result.",
    },
  ],
  "/dashboards": [
    {
      title: "Sharing stays permissioned",
      body: "A shared dashboard renders read-only and never exposes private data the viewer is not allowed to see.",
    },
  ],
  "/monitors": [
    {
      title: "From watching to why",
      body: "When a metric moves past its band, open the alert for a plain-language root-cause explanation with the supporting figures.",
    },
  ],
  "/semantic": [
    {
      title: "One definition",
      body: "A metric defined here is the same figure in the assistant, dashboards, notebooks and monitors.",
    },
  ],
  "/workbench": [
    {
      title: "Least privilege",
      body: "SQL and notebooks run under a least-privilege identity inside the sandbox. Write statements and masked personal columns are blocked.",
    },
  ],
  "/audit": [
    {
      title: "Nothing is altered",
      body: "No role can change an existing audit entry. An auditor can reconstruct how any figure was produced.",
    },
  ],
  "/clean": [
    {
      title: "Profile first",
      body: "Read emptiness, patterns, missingness (MCAR, MAR, MNAR), keys and orphans before you change a cell. The profile decides which methods are valid.",
    },
    {
      title: "Everyday or expert",
      body: "The everyday path offers one suggested method per problem, in plain language, with a before-and-after. Expert mode and All methods unlock imputation, linkage, isolation forests, constraint repair and the recorded transform.",
    },
    {
      title: "The recipe is the artefact",
      body: "Accepted steps are saved in order. You can undo, share or rerun the recipe. Bronze never changes.",
    },
  ],
};

export const cleaningWalkthrough: HelpTopic[] = [
  {
    title: "Read the profile first",
    body: "Emptiness, mixed types, duplicate keys, rare patterns and orphan IDs are shown before you touch anything. That measurement tells us why a blank is blank.",
  },
  {
    title: "One family of problems at a time",
    body: "Missing values, then repeats, then extremes, then formats, types, labels, shape, rules and privacy. Skip a family if it does not apply.",
  },
  {
    title: "Everyday first, expert when you need it",
    body: "The suggested method is the safe default. Open Expert or All methods for MICE, linkage, Isolation Forest, fingerprints and constraint repair, with the recorded code.",
  },
  {
    title: "Bronze never changes",
    body: "Cleaning writes a silver dataset and a versioned recipe. The raw upload stays immutable, so the work is always reversible.",
  },
];
