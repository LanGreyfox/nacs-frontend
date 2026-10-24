/**
 * Polls the authenticated backend `GET /api/v1/peers` endpoint on an interval.
 *
 * Mirrors `useStatus`: the first request runs on mount, later requests are
 * scheduled after each request settles, and polling stops on unmount.
 */

import { onMounted, onUnmounted, ref, type Ref } from 'vue'

import { fetchPeers, type PeersData } from '@/api/backend'

export interface UsePeersResult {
  /** Latest peers payload, or `null` while the API is unreachable. */
  peers: Ref<PeersData | null>
}

export function usePeers(intervalMs = 10_000): UsePeersResult {
  const peers = ref<PeersData | null>(null)

  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  async function poll(): Promise<void> {
    try {
      peers.value = await fetchPeers()
    } catch {
      peers.value = null
    } finally {
      if (!stopped) {
        timer = setTimeout(() => void poll(), intervalMs)
      }
    }
  }

  onMounted(() => {
    void poll()
  })

  onUnmounted(() => {
    stopped = true
    clearTimeout(timer)
  })

  return { peers }
}
