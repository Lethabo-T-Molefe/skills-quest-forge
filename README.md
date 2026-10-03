# DataForge web app

The web app for DataForge: a governed analytics workspace where a file goes from upload to a shared answer.
Built with React, TanStack Router, TanStack Query and Tailwind CSS. It talks to the DataForge API in
[`../dataforge.backend`](../dataforge.backend); nothing in the app is mocked.

## Running it

You need Node.js and npm, and the API running (see the backend's README).

```sh
npm install
cp .env.example .env      # VITE_API_URL, default http://localhost:8000/api/v1
npm run dev               # http://localhost:5173
```

The API must allow this origin (`CORS_ORIGINS`) and link back to it in emails (`FRONTEND_URL`). Both default to
`http://localhost:5173`.

`npm run dev` reads `.env` (your local API). `npm run build` reads `.env.production`, which is committed and
holds the deployed API's address, so the deployed site never calls `localhost`. A `VITE_API_URL` set on the
build host overrides it.

### Deploying on Render

`render.yaml` describes the static site: build with `npm ci && npm run build`, publish `dist/`, and rewrite
every path to `/index.html`. That rewrite matters: the app routes in the browser, so without it reloading
any page other than the home page, or opening a link from an email, returns 404. On a site created by hand,
add it under **Redirects/Rewrites**: source `/*`, destination `/index.html`, action **Rewrite**.

With the API in demo mode (`DEMO_MODE=true`), the sign-in page offers "Use the demo workspace" for each role, and
Settings lets you switch between the seeded members. Demo mode is refused in production.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/`, one chunk per page |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint, including Prettier formatting |
| `npx tsc --noEmit` | Type-check |

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
The API works out every result; the app sends the settings and draws what comes back. Superset and Jupyter open
from the app already signed in, and a Superset dashboard can be viewed inside it.

Other routes: `/settings` (profile, quotas, multi-factor authentication, password, Slack), `/search`,
`/forgot-password` and `/reset-password` (also used by invitations), `/verify`, and `/embed/:dashboardId`, a
read-only page another internal application can put in a frame using a dashboard's signed embed link.

Older addresses (`/assistant`, `/explorer`, `/workbench`, `/predict`, `/datasets/:id/clean`) redirect to their new homes.

## Working with the API

- **`src/lib/api.ts`** is the only place that calls the API. The access token is kept in memory; the refresh token
  never reaches the app, because the API keeps it in an HttpOnly cookie for its auth endpoints. Every request
  is sent with credentials so that cookie works across the app's and the API's ports. Local storage only holds
  a marker that a session exists, so a reload knows to ask for a new access token. A 401 triggers one shared
  refresh, then the request is retried once. When the API ends the session, the app clears its cache and returns
  to sign-in. Uploads use `api.upload`, which reports how much of the file has been sent.
- **Notifications** (`src/features/notifications`) are checked every minute and shown under the bell in the top
  bar: alerts, decisions on the member's data, data waiting for a steward, shares and refresh problems.
- **Ask** sends the id of the latest answer in the conversation as `contextId`, so follow-ups ("what about
  Gauteng?") build on it. "Start a new topic" stops that.
- **Errors** arrive as `ApiError` with the API's own message. `errorMessage()` turns one into text for a person;
  `notifyError()` (in `src/lib/notify.ts`) is the `onError` handler mutations use.
- **Permissions** come from the API with the signed-in member (`user.permissions`). The checks in
  `src/features/auth/permissions.ts` only decide what to show; the API enforces every one of them.
- **Reads** are TanStack Query `queryOptions` in each feature's `api/` folder. Route loaders in `src/App.tsx`
  preload what a page needs, and turn the API's "not found" into the not-found page.
- **Writes** are `useMutation` calls that invalidate the queries they affect, so every screen showing that data
  updates.

## Project structure

```
src/
├── assets/        # Global styles
├── components/    # Shared UI (buttons, tabs, drawers, page layout pieces)
│   └── ui/        # shadcn/ui design-system components
├── features/      # Feature modules: analysis, assistant, audit, auth, cleaning, connectors, dashboards,
│   │              # datasets, integrations, metrics, monitors, policies, predictions, search, sharing, workbench
│   └── <feature>/
│       ├── api/         # Calls to the DataForge API, as query options and mutation functions
│       ├── components/  # Feature-specific components
│       ├── hooks/       # React Query hooks
│       ├── types.ts     # The shapes the API returns
│       └── index.ts     # Public API — import features only through this
├── pages/         # Route-level pages that compose features (analyse/ holds the Analyse area)
├── layouts/       # MainLayout, AuthLayout, PublicLayout
├── hooks/         # Shared hooks
├── lib/           # The API client, formatting and small utilities
├── stores/        # Global state (sidebar collapse)
├── config/        # Site settings, navigation and public pages
├── App.tsx        # Router, routes, loaders and providers
└── main.tsx       # Entry point
```

### Layout

The page always scrolls as one. `src/components/PageLayout.tsx` holds the pieces tool pages are built from:
`SplitLayout` and `SideRail` (a settings or steps column that stays in view on large screens and stacks on small
ones), `StickyActions` (Next, Run, Ask stay reachable on a long page) and `TableFrame` (a wide table scrolls
sideways inside its own frame, never the page). Pages are checked at 320, 768, 1024 and 1440 pixels.
