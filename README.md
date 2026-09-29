# DataForge

Frontend prototype built with React, TanStack Router, TanStack Query and Tailwind CSS, using mock data.

## Development

You need Node.js and npm.

```sh
npm i
npm run dev
```

## How the app is organised

The signed-in app follows the path a person takes with their data:

| Step | Page | Route |
| --- | --- | --- |
| Home | Next steps, key numbers, what needs attention | `/workspace` |
| 1 | Datasets: bring data in (upload, connect) and find it | `/datasets` |
| 2 | Clean: profile a file and fix it step by step | `/clean`, `/clean/:datasetId` |
| 3 | Analyse: choose the data, the method and the way of working | `/analyse` |
| 4 | Dashboards: save and share results | `/dashboards` |
| 5 | Monitors: watch metrics and explain changes | `/monitors` |

Governance pages (Metrics, Approvals, Audit trail, Users and roles) sit below the workflow and are shown by role.

Analyse has one area with four ways of working that share the chosen dataset and method:
Ask (`/analyse/ask`), Build a chart (`/analyse/build`), Write SQL (`/analyse/code`) and Predict (`/analyse/predict`).
The methods (summarise, compare, trend, relationship, explain a change, predict) and their options live in
`src/features/analysis`, which also generates the SQL that matches each chart.

Older addresses (`/assistant`, `/explorer`, `/workbench`, `/predict`, `/datasets/:id/clean`) redirect to their new homes.

## Project structure

```
src/
├── assets/        # Global styles
├── components/    # Shared UI (buttons, tabs, drawers, journey steps)
│   └── ui/        # shadcn/ui design-system components
├── features/      # Feature modules: analysis, auth, cleaning, datasets, monitors, ...
│   └── <feature>/
│       ├── api/         # Data access (currently mock data)
│       ├── components/  # Feature-specific components
│       ├── hooks/       # React Query hooks
│       ├── types.ts
│       └── index.ts     # Public API — import features only through this
├── pages/         # Route-level pages that compose features (analyse/ holds the Analyse area)
├── layouts/       # MainLayout, AuthLayout, PublicLayout
├── hooks/         # Shared hooks
├── lib/           # Shared utilities
├── stores/        # Global state (sidebar collapse)
├── types/         # Shared types
├── config/        # Site settings, navigation and public pages
├── App.tsx        # Router, routes and providers
└── main.tsx       # Entry point
```

Routes are defined in `App.tsx`. Each route's loader preloads its data into the query cache, so pages read it with the feature hooks without loading states.

Tool pages (the cleaning wizard, the Analyse area, the audit trail) fill the screen on large displays, and only their own panels scroll.
