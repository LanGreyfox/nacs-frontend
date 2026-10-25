import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'

import { fetchFiles, type FilesData } from '@/api/backend'
import { useFiles } from '@/composables/useFiles'

vi.mock('@/api/backend', () => ({
  fetchFiles: vi.fn<typeof fetchFiles>(),
}))

const fetchFilesMock = vi.mocked(fetchFiles)

const filesFixture: FilesData = {
  resources: [
    { path: '/a.txt', kind: 'file', size: 1, checksum: 'abc', updated_at: '2026-09-13T07:50:23Z' },
  ],
  tombstones: [],
  pagination: { limit: 100, offset: 0, total: 1, has_more: false },
}

// useFiles relies on the component lifecycle, so it is tested inside a host component.
function mountUseFiles(intervalMs?: number): {
  wrapper: VueWrapper
  files: Ref<FilesData | null>
  loadMore: () => Promise<void>
} {
  let files!: Ref<FilesData | null>
  let loadMore!: () => Promise<void>
  const Host = defineComponent({
    setup() {
      ;({ files, loadMore } = useFiles(intervalMs))
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, files, loadMore }
}

function page(paths: string[], offset: number, total: number): FilesData {
  return {
    resources: paths.map((path) => ({
      path,
      kind: 'file',
      size: 1,
      checksum: null,
      updated_at: '2026-09-13T07:50:23Z',
    })),
    tombstones: [],
    pagination: {
      limit: 200,
      offset,
      total,
      has_more: offset + paths.length < total,
    },
  }
}

describe('useFiles', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    fetchFilesMock.mockResolvedValue(filesFixture)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('fetches files immediately on mount', async () => {
    const { wrapper, files } = mountUseFiles()
    await flushPromises()

    expect(fetchFilesMock).toHaveBeenCalledTimes(1)
    expect(files.value).toEqual(filesFixture)

    wrapper.unmount()
  })

  it('polls again after the default 10 second interval', async () => {
    const { wrapper } = mountUseFiles()
    await flushPromises()

    await vi.advanceTimersByTimeAsync(9_999)
    expect(fetchFilesMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(fetchFilesMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('sets files to null when a request fails', async () => {
    const { wrapper, files } = mountUseFiles()
    await flushPromises()

    fetchFilesMock.mockRejectedValueOnce(new Error('boom'))
    await vi.advanceTimersByTimeAsync(10_000)
    await flushPromises()

    expect(files.value).toBeNull()

    wrapper.unmount()
  })

  it('stops polling after the component unmounts', async () => {
    const { wrapper } = mountUseFiles()
    await flushPromises()

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(fetchFilesMock).toHaveBeenCalledTimes(1)
  })

  it('appends the next page on loadMore', async () => {
    fetchFilesMock.mockResolvedValueOnce(page(['/a'], 0, 2))
    const { wrapper, files, loadMore } = mountUseFiles()
    await flushPromises()
    expect(files.value?.pagination.has_more).toBe(true)

    fetchFilesMock.mockResolvedValueOnce(page(['/b'], 1, 2))
    await loadMore()

    expect(fetchFilesMock).toHaveBeenLastCalledWith({ limit: 200, offset: 1 })
    expect(files.value?.resources.map((r) => r.path)).toEqual(['/a', '/b'])
    expect(files.value?.pagination.has_more).toBe(false)

    wrapper.unmount()
  })

  it('does not request more when everything is loaded', async () => {
    const { wrapper, loadMore } = mountUseFiles()
    await flushPromises()

    await loadMore()

    expect(fetchFilesMock).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('reloads all loaded pages when polling', async () => {
    fetchFilesMock.mockResolvedValueOnce(page(['/a'], 0, 2))
    const { wrapper, files, loadMore } = mountUseFiles()
    await flushPromises()
    fetchFilesMock.mockResolvedValueOnce(page(['/b'], 1, 2))
    await loadMore()

    fetchFilesMock.mockResolvedValueOnce(page(['/a'], 0, 2))
    fetchFilesMock.mockResolvedValueOnce(page(['/b'], 1, 2))
    await vi.advanceTimersByTimeAsync(10_000)

    expect(files.value?.resources.map((r) => r.path)).toEqual(['/a', '/b'])

    wrapper.unmount()
  })
})
