# DataForge

Frontend prototype built with React, TanStack Router, TanStack Query and Tailwind CSS, using mock data.

## Development

You need Node.js and npm.

```sh
npm i
npm run dev
```

## Project structure

```
src/
├── assets/        # Global styles
├── components/    # Shared UI (Chip, Panel, buttons)
│   └── ui/        # shadcn/ui design-system components
├── features/      # Feature modules: auth, datasets, metrics, monitors, audit, ...
│   └── <feature>/
│       ├── api/         # Data access (currently mock data)
│       ├── components/  # Feature-specific components
│       ├── hooks/       # React Query hooks
│       ├── types.ts
│       └── index.ts     # Public API — import features only through this
├── pages/         # Route-level pages that compose features
├── layouts/       # MainLayout
├── hooks/         # Shared hooks
├── lib/           # Shared utilities
├── stores/        # Global state
├── types/         # Shared types
├── config/        # Site settings and navigation
├── App.tsx        # Router, routes and providers
└── main.tsx       # Entry point
```

Routes are defined in `App.tsx`. Each route's loader preloads its data into the query cache, so pages read it with the feature hooks without loading states.
