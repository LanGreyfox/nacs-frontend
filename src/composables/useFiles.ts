/**
 * Polls the authenticated backend `GET /api/v1/files` endpoint on an interval
 * and loads further pages on demand (continuous scrolling).
 *
 * Mirrors `usePeers`: the first request runs on mount, later requests are
 * scheduled after each request settles, and polling stops on unmount.
 * Every poll reloads at least as many entries as are currently loaded.
 */

import { onMounted, onUnmounted, ref, type Ref } from 'vue'

import { fetchFiles, type FilesData } from '@/api/backend'

// The backend clamps `limit` to 1000.
const PAGE_SIZE = 200

export interface UseFilesResult {
  /** Entries loaded so far, or `null` while the API is unreachable. */
  files: Ref<FilesData | null>
  /** Appends the next page; no-op when everything is loaded or a request is running. */
  loadMore: () => Promise<void>
}

function appendPage(current: FilesData, next: FilesData): FilesData {
  return {
    resources: [...current.resources, ...next.resources],
    tombstones: current.tombstones,
    pagination: next.pagination,
  }
}

export function useFiles(intervalMs = 10_000): UseFilesResult {
  const files = ref<FilesData | null>(null)

  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  let loadingMore = false

  async function fetchPages(minCount: number): Promise<FilesData> {
    let result = await fetchFiles({ limit: PAGE_SIZE, offset: 0 })
    while (result.pagination.has_more && result.resources.length < minCount) {
      const next = await fetchFiles({ limit: PAGE_SIZE, offset: result.resources.length })
      result = appendPage(result, next)
    }
    return result
  }

  async function poll(): Promise<void> {
    try {
      files.value = await fetchPages(files.value?.resources.length ?? 0)
    } catch {
      files.value = null
    } finally {
      if (!stopped) {
        timer = setTimeout(() => void poll(), intervalMs)
      }
    }
  }

  async function loadMore(): Promise<void> {
    const current = files.value
    if (!current || !current.pagination.has_more || loadingMore) return

    loadingMore = true
    const offset = current.resources.length
    try {
      const next = await fetchFiles({ limit: PAGE_SIZE, offset })
      // A poll may have replaced the data while the request was running.
      if (files.value?.resources.length === offset) {
        files.value = appendPage(files.value, next)
      }
    } catch {
      // Keep the loaded entries; the next intersection retries.
    } finally {
      loadingMore = false
    }
  }

  onMounted(() => {
    void poll()
  })

  onUnmounted(() => {
    stopped = true
    clearTimeout(timer)
  })

  return { files, loadMore }
}
