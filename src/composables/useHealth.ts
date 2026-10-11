/**
 * Polls the backend `GET /health` endpoint on an interval.
 *
 * The first request runs immediately on mount; subsequent requests are
 * scheduled with a recursive `setTimeout` after each request settles, so
 * overlapping requests cannot pile up when a request takes longer than the
 * polling interval. Polling stops automatically when the component unmounts.
 */

import { onMounted, onUnmounted, ref, type Ref } from 'vue'

import { fetchHealth, type HealthData } from '@/api/health'

export interface UseHealthResult {
  /** Latest health payload, or `null` while the API is unreachable. */
  health: Ref<HealthData | null>
}

export function useHealth(intervalMs = 10_000): UseHealthResult {
  const health = ref<HealthData | null>(null)

  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  async function poll(): Promise<void> {
    try {
      health.value = await fetchHealth()
    } catch {
      // HTTP and network errors both surface as "API not connected".
      health.value = null
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

  return { health }
}
