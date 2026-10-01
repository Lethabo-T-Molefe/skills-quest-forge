export interface HelpTopic {
  title: string;
  body: string;
}

export const cleaningWalkthrough: HelpTopic[] = [
  {
    title: "Read the profile first",
    body: "Emptiness, mixed types, duplicate keys, rare patterns and orphan IDs are shown before you touch anything. That measurement tells us why a blank is blank.",
  },
  {
    title: "One family of problems at a time",
    body: "The steps on the left run from missing values to privacy. Work through them in order, or jump to any step. Skip a step if it does not apply.",
  },
  {
    title: "Everyday first, expert when you need it",
    body: "The suggested method is the safe default. Switch to Expert, or open Every method, for MICE, record linkage, Isolation Forest, fingerprints and constraint repair, with the recorded code.",
  },
  {
    title: "Bronze never changes",
    body: "Cleaning writes a silver dataset and a versioned recipe. The raw upload stays as it arrived, so the work can always be redone differently.",
  },
];

const pageHelp: Record<string, HelpTopic[]> = {
  "/workspace": [
    {
      title: "The path through DataForge",
      body: "Bring data in, clean it, get it approved, then analyse and share it. Home shows where each of your datasets is on that path and what to do next.",
    },
    {
      title: "Shared numbers",
      body: "The figures on Home use the shared metric definitions, so they match dashboards and the assistant.",
    },
  ],
  "/datasets": [
    {
      title: "Bronze, silver and gold",
      body: "Bronze is raw and never changes. Silver is cleaned, typed, masked and deduplicated. Gold is ready for dashboards and shared metrics.",
    },
    {
      title: "The next step is on every dataset",
      body: "Each dataset shows its next step: clean it, wait for approval, or analyse it. Nothing can be analysed until a steward approves it.",
    },
  ],
  "/datasets/upload": [
    {
      title: "What happens to a file",
      body: "It lands in your workspace, is profiled, and is scanned for personal information. Matching columns are masked before anyone can read them.",
    },
  ],
  "/datasets/connect": [
    {
      title: "Read-only by design",
      body: "A connector reads from a live source under short-lived credentials. Its tables appear in the catalogue as pending until a steward approves them.",
    },
  ],
  "/clean": [
    {
      title: "Choose a file to clean",
      body: "Files waiting in bronze are listed first. Open one to profile it and work through its problems one family at a time. A silver table can be reopened to rerun its recipe.",
    },
    {
      title: "Bronze never changes",
      body: "Cleaning writes a new silver table and a versioned recipe. The original stays as it arrived.",
    },
  ],
  "/clean/": cleaningWalkthrough,
  "/analyse": [
    {
      title: "Three choices",
      body: "Pick the data, the kind of question (the method), and how you want to work. You can change any of them later without losing your place.",
    },
    {
      title: "Which method?",
      body: "Summarise describes one measure. Compare puts groups side by side. Trend follows months. Relationship tests whether two measures move together. Explain splits a change into its parts. Predict scores a cohort.",
    },
    {
      title: "Which way of working?",
      body: "Ask for a quick answer in plain English. Build a chart to decide exactly how the numbers are calculated. Write SQL for full control. All three show the code behind the result.",
    },
  ],
  "/analyse/ask": [
    {
      title: "Grounded answers only",
      body: "The assistant answers with shared metrics and data you may see. If it cannot ground a question, it says so instead of guessing.",
    },
    {
      title: "Take an answer further",
      body: "Open any answer as SQL, or rebuild it as a chart to change how it is calculated.",
    },
  ],
  "/analyse/build": [
    {
      title: "You choose the method",
      body: "Every option under How it is calculated changes the numbers, and says how. The reading, table and SQL update with it.",
    },
    {
      title: "Save or take it further",
      body: "Save the chart to a dashboard to share it, or open its SQL to extend it with joins and custom logic.",
    },
  ],
  "/analyse/code": [
    {
      title: "Start from a template",
      body: "Each method has a template for the chosen dataset. Change it freely: it runs in your sandbox under a read-only identity.",
    },
    {
      title: "Least privilege",
      body: "Write statements and masked personal columns are blocked. Only permitted objects are mounted.",
    },
  ],
  "/analyse/predict": [
    {
      title: "Explainable by design",
      body: "The score comes with a ranked list of factors and their weights, which always add up to 1. The model version is recorded.",
    },
  ],
  "/dashboards": [
    {
      title: "Sharing stays permissioned",
      body: "A shared dashboard is read-only and never shows data the viewer is not allowed to see.",
    },
    { title: "Add to a dashboard", body: "Save any chart from Analyse to add it here." },
  ],
  "/monitors": [
    {
      title: "From watching to why",
      body: "When a metric moves past its band, open the alert for a plain-language explanation with the supporting figures, or explore the change yourself.",
    },
  ],
  "/semantic": [
    {
      title: "One definition",
      body: "A metric defined here is the same figure in the assistant, dashboards, notebooks and monitors.",
    },
  ],
  "/governance": [
    {
      title: "Nothing is used until approved",
      body: "A steward reviews each dataset's profile and classification. Approval makes it available for analysis. The decision and reason are recorded.",
    },
  ],
  "/audit": [
    {
      title: "Nothing is altered",
      body: "No role can change an existing audit entry. An auditor can reconstruct how any figure was produced.",
    },
  ],
  "/admin": [
    {
      title: "Roles decide access",
      body: "A role bundles what a member can see and do with how much compute, storage and AI they may use. Changes are written to the audit trail.",
    },
  ],
  "/settings": [
    {
      title: "Preview a role",
      body: "In this prototype you can switch role to see how the screens change for other people.",
    },
  ],
  "/search": [
    {
      title: "One search for everything",
      body: "Search covers datasets, metrics, dashboards and members.",
    },
  ],
};

/** Help for the current page: the most specific matching path, falling back to Home. */
export function helpFor(pathname: string): HelpTopic[] {
  if (pageHelp[pathname]) return pageHelp[pathname];
  const match = Object.keys(pageHelp)
    .filter(
      (key) => key !== "/workspace" && pathname.startsWith(key.endsWith("/") ? key : `${key}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
  return (match ? pageHelp[match] : undefined) ?? pageHelp["/workspace"] ?? [];
}
