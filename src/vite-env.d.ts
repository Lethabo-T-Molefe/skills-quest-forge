/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the DataForge API, including the version prefix. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
