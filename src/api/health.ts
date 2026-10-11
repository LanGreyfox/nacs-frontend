/**
 * Client for the backend `GET /health` endpoint.
 *
 * The base URL comes from the central env module (see `src/config/env.ts`),
 * which fails fast at app startup when `VITE_API_BASE_URL` is missing.
 */

import { env } from '@/config/env'

/** Shape of the JSON payload returned by `GET /health`. */
export interface HealthData {
  status: string
  version: string
  uptime_seconds: number
}

/**
 * Fetches the health status of the backend API.
 *
 * @returns A promise resolving with the parsed `HealthData` payload.
 * @throws An `Error` with status details when the endpoint responds with a
 *   non-OK status. Network failures propagate unchanged from `fetch`.
 */
export async function fetchHealth(): Promise<HealthData> {
  const response = await fetch(`${env.apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error(`GET /health failed with ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as HealthData
}
