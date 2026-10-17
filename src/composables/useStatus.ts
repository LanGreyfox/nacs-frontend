/**
 * Polls the authenticated backend `GET /api/v1/status` endpoint on an interval.
 *
 * Mirrors `useHealth`: the first request runs on mount, later requests are
 * scheduled after each request settles, and polling stops on unmount.
 */

import { onMounted, onUnmounted, ref, type Ref } from 'vue'

import { fetchStatus, type StatusData } from '@/api/backend'

export interface UseStatusResult {
  /** Latest status payload, or `null` while the API is unreachable. */
  status: Ref<StatusData | null>
}

export function useStatus(intervalMs = 10_000): UseStatusResult {
  const status = ref<StatusData | null>(null)

  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  async function poll(): Promise<void> {
    try {
      status.value = await fetchStatus()
    } catch {
      status.value = null
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

  return { status }
}
