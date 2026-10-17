import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'

import { fetchStatus, type StatusData } from '@/api/backend'
import { useStatus } from '@/composables/useStatus'

vi.mock('@/api/backend', () => ({
  fetchStatus: vi.fn<typeof fetchStatus>(),
}))

const fetchStatusMock = vi.mocked(fetchStatus)

const statusFixture: StatusData = {
  sync: { is_active: false, current_transfer: null, queue_length: 0 },
  peers_connected: 2,
}

// useStatus relies on the component lifecycle (onMounted/onUnmounted), so it
// is tested inside a minimal host component. Only the timer APIs used by the
// composable are faked, keeping microtask-based flushPromises working.
function mountUseStatus(intervalMs?: number): {
  wrapper: VueWrapper
  status: Ref<StatusData | null>
} {
  let status!: Ref<StatusData | null>
  const Host = defineComponent({
    setup() {
      ;({ status } = useStatus(intervalMs))
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, status }
}

describe('useStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    fetchStatusMock.mockResolvedValue(statusFixture)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('fetches status immediately on mount', async () => {
    const { wrapper, status } = mountUseStatus()
    await flushPromises()

    expect(fetchStatusMock).toHaveBeenCalledTimes(1)
    expect(status.value).toEqual(statusFixture)

    wrapper.unmount()
  })

  it('polls again after the default 10 second interval', async () => {
    const { wrapper } = mountUseStatus()
    await flushPromises()
    expect(fetchStatusMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(9_999)
    expect(fetchStatusMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(fetchStatusMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('sets status to null when a request fails', async () => {
    const { wrapper, status } = mountUseStatus()
    await flushPromises()
    expect(status.value).toEqual(statusFixture)

    fetchStatusMock.mockRejectedValueOnce(new Error('boom'))
    await vi.advanceTimersByTimeAsync(10_000)
    await flushPromises()

    expect(status.value).toBeNull()

    wrapper.unmount()
  })

  it('stops polling after the component unmounts', async () => {
    const { wrapper } = mountUseStatus()
    await flushPromises()

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(fetchStatusMock).toHaveBeenCalledTimes(1)
  })

  it('respects a custom polling interval', async () => {
    const { wrapper } = mountUseStatus(1_000)
    await flushPromises()

    await vi.advanceTimersByTimeAsync(1_000)

    expect(fetchStatusMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })
})
