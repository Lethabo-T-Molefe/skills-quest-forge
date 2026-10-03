/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the DataForge API, including the version prefix. */
  readonly VITE_API_URL?: string;
  /** The largest upload in MB, as the API's MAX_UPLOAD_MB. Defaults to 250. */
  readonly VITE_MAX_UPLOAD_MB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
