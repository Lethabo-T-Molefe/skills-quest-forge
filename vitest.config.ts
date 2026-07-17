import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Standalone config (not layered on vite.config.ts) — the app's vite config
// is wrapped by @lovable.dev/vite-tanstack-config (TanStack Start SSR, etc.)
// which vitest doesn't need; tests only need the @ alias, React, and jsdom.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
