/**
 * Central, typed access to environment variables.
 *
 * Vite exposes env vars via `import.meta.env` (only `VITE_`-prefixed
 * variables are included in the client bundle). Always access them through
 * this module instead of using `import.meta.env` directly, so missing
 * required values fail fast at app startup instead of causing subtle
 * runtime errors later.
 */

function requireEnv(key: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Missing required environment variable "${key}". ` +
        'Set it in the .env file for the current mode ' +
        '(e.g. .env.development or .env.production).',
    )
  }
  return value
}

export const env = Object.freeze({
  /** Base URL of the backend API, e.g. "http://localhost:8080" */
  apiBaseUrl: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  /** Current Vite mode, e.g. "development" or "production" */
  mode: import.meta.env.MODE,
  /** True when running in a non-production build */
  isDev: import.meta.env.DEV,
  /** True when running in a production build */
  isProd: import.meta.env.PROD,
})

export type AppEnv = typeof env
