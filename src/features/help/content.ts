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
      title: "One step at a time",
      body: "Preview each cleaning step on a sample, then accept, adjust or skip it. Accepted steps become a versioned recipe you can rerun.",
    },
  ],
};

export const cleaningWalkthrough: HelpTopic[] = [
  {
    title: "Read the quality profile first",
    body: "Missing values, mixed types, duplicates and outliers are shown before you touch anything.",
  },
  {
    title: "Preview on a sample",
    body: "Each step runs on a sample inside the sandbox. You see before and after, then decide.",
  },
  {
    title: "The recipe is the artefact",
    body: "Accepted steps are saved in order. You can undo, reorder, share or rerun the recipe on a new version of the file.",
  },
  {
    title: "Bronze never changes",
    body: "Cleaning writes a silver dataset. The raw upload stays immutable, so the work is always reversible.",
  },
];
