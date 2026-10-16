/** Clients for the authenticated `/api/v1` backend endpoints (Basic Auth). */

import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth'

export interface Credentials {
  username: string
  password: string
}

export interface TransferDetails {
  path: string
  peer_id: string
  event_kind: string
  progress_bytes: number
  total_bytes: number
  username: string
}

export interface SyncStatus {
  is_active: boolean
  current_transfer: TransferDetails | null
  queue_length: number
}

export interface StatusData {
  sync: SyncStatus
  peers_connected: number
}

export interface Pagination {
  limit: number
  offset: number
  total: number
  has_more: boolean
}

// Peer item fields are not known yet (only the empty list has been observed).
export type Peer = Record<string, unknown>

export interface PeersData {
  peers: Peer[]
  pagination: Pagination
}

export interface FileResource {
  path: string
  kind: string
  size: number
  checksum: string | null
  updated_at: string
}

// Tombstone fields are not known yet (only the empty list has been observed).
export type Tombstone = Record<string, unknown>

export interface FilesData {
  resources: FileResource[]
  tombstones: Tombstone[]
  pagination: Pagination
}

export interface PeersParams {
  limit?: number
  offset?: number
}

export interface FilesParams {
  limit?: number
  offset?: number
  kind?: string
  path_prefix?: string
}

/** Error thrown for non-OK responses; `status` allows distinguishing 401 from other failures. */
export class HttpError extends Error {
  readonly status: number

  constructor(method: string, path: string, response: Response) {
    super(`${method} ${path} failed with ${response.status} ${response.statusText}`)
    this.name = 'HttpError'
    this.status = response.status
  }
}

function basicAuthHeader({ username, password }: Credentials): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return `Basic ${btoa(binary)}`
}

async function getJson<T>(
  path: string,
  params: object = {},
  credentials?: Credentials,
): Promise<T> {
  const resolved = credentials ?? useAuthStore().credentials
  if (!resolved) {
    throw new Error('Not authenticated')
  }

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const queryString = query.toString()

  const response = await fetch(`${env.apiBaseUrl}${path}${queryString ? `?${queryString}` : ''}`, {
    headers: { Authorization: basicAuthHeader(resolved) },
  })

  if (!response.ok) {
    throw new HttpError('GET', path, response)
  }

  return (await response.json()) as T
}

/** Pass `credentials` to verify them before they are stored (e.g. at login). */
export function fetchStatus(credentials?: Credentials): Promise<StatusData> {
  return getJson<StatusData>('/api/v1/status', {}, credentials)
}

export function fetchPeers(params: PeersParams = {}): Promise<PeersData> {
  return getJson<PeersData>('/api/v1/peers', params)
}

export function fetchFiles(params: FilesParams = {}): Promise<FilesData> {
  return getJson<FilesData>('/api/v1/files', params)
}
