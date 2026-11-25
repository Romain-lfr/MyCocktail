/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Commit déployé (GitHub Actions), affiché sur la page À propos */
  readonly VITE_BUILD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
