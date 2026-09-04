# Serves the production build via `vite preview` — verified locally to
# actually work (curl http://localhost:4173/ -> 200).
#
# Note on scope: this project's build target defaults to Cloudflare
# (nitro's "cloudflare" preset, set in vite.config.ts via
# @lovable.dev/vite-tanstack-config) — its real production deploy path is
# very likely Cloudflare Pages/Workers via that platform's own tooling, not
# a container. `dist/server/server.js` from that build is a small SSR
# error-wrapper, not a standalone Node server, and attempts to override the
# preset via the standard NITRO_PRESET=node-server env var did not change
# that (the shared config package appears to set the preset itself,
# overriding Nitro's normal env-var resolution). Forcing a different build
# target risks diverging from how this app is actually deployed, so this
# Dockerfile deliberately serves the same `dist/client` build vite preview
# already serves in local dev/CI, rather than guess at a Node-server nitro
# configuration that was never confirmed to work.
FROM node:22-alpine AS build
WORKDIR /app
# node:22-alpine bundles npm 10.9.x; package-lock.json here was written by
# npm 11.x (whatever's installed on dev machines) and `npm ci` on the older
# npm rejected it as out of sync (EUSAGE, "Missing: lru-cache@11.5.2") even
# though the same lockfile passes `npm ci --dry-run` fine locally — a real,
# verified npm-version lockfile-compatibility gap, not a flaky failure.
RUN npm install -g npm@11
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
