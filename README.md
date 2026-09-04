# CHIETA Data Lab — Frontend

React 19 + TanStack Start/Router SPA for the CHIETA Data Lab, talking to
[`CHIETA.DataLab.Backend`](../CHIETA.DataLab.Backend) (FastAPI) over a REST
API, and linking out to the [`playground`](../playground) Docker Compose
stack (JupyterHub, Superset, MLflow, code-server) for the Analytics tools.

## Quick start

1. Copy environment variables:
   - PowerShell: `Copy-Item .env.example .env -Force`
   - bash: `cp .env.example .env`
2. Install dependencies: `npm install`
3. Start the backend first (see `../CHIETA.DataLab.Backend/README.md`) —
   this app has no mock-data fallback for most pages; it expects a real
   API at `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).
4. Run the dev server: `npm run dev` (default `http://localhost:8080`).
5. Sign in at `/signin` as any of the 8 seeded demo identities — every one
   uses the password `chieta` (see
   `CHIETA.DataLab.Backend/scripts/seed_parts/users_roles_lineage.py`).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (`dist/client` + `dist/server`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier, writes in place |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:coverage` | Vitest with coverage (whole `src/` tree, see `vitest.config.ts`) |

## Architecture

```
src/
├── routes/            # File-based routes (TanStack Router) — one file per
│                       # page, `app.<name>.tsx` under the /app layout.
│                       # A leading "-" (e.g. -signin.test.tsx) excludes a
│                       # file from route generation — used for test files
│                       # that live alongside their route for co-location.
├── lib/
│   ├── api/            # One file per backend domain — thin fetch wrappers,
│   │                    # routed through lib/http.ts's apiFetch (attaches
│   │                    # the signed-in user's bearer token automatically).
│   ├── queries/         # TanStack Query hooks wrapping lib/api/*.
│   ├── auth.ts          # Session (JWT + user) storage — localStorage.
│   ├── http.ts           # apiFetch: attaches the bearer token, handles 401.
│   ├── role-context.tsx  # RoleProvider/useRole — role comes from the real
│   │                      # signed-in session, not a free client-side pick.
│   ├── nav.ts             # Per-role sidebar nav — the single source of
│   │                       # truth the backend's RBAC groups (core/permissions.py
│   │                       # in the backend repo) are kept in sync with.
│   └── roles.ts            # The 8 role names + demo identity metadata.
└── components/
    ├── ui/              # shadcn/ui primitives (Radix + Tailwind).
    └── lab/              # App-specific components (charts, panels, sidebar…).
```

## Authentication

Real, not decorative: `/signin` calls the backend's `POST /auth/login`
(bcrypt-verified password, JWT issued), and every request under `/app/*` is
gated by a router `beforeLoad` guard (`src/routes/app.tsx`) that redirects to
`/signin` if no valid session is stored. The displayed role always comes
from the authenticated user's real role, never a client-side toggle.

## UI library

[shadcn/ui](https://ui.shadcn.com) ("new-york" style) on Radix UI primitives
+ Tailwind CSS v4, icons via [lucide-react](https://lucide.dev). Charts are
[Recharts](https://recharts.org).

## Testing

Vitest + Testing Library. Component/route tests live next to what they test
(`app.foo.tsx` / `app.foo.test.tsx`); a route-file test is prefixed with `-`
so TanStack Router's file-based route generator skips it.

## Deployment

`npm run build`'s default target is Cloudflare (the `nitro` preset baked
into `@lovable.dev/vite-tanstack-config`'s `vite.config.ts`) — that's this
app's real production deploy path. A `Dockerfile` is also provided for local
container use; it serves the built client via `npm run preview`, not the
Cloudflare Worker bundle (`dist/server/server.js` from the default build is
a small SSR error-wrapper, not a standalone Node server — see the comment
at the top of the Dockerfile for what was actually verified here).
