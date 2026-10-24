import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'

import { fetchPeers, type PeersData } from '@/api/backend'
import { usePeers } from '@/composables/usePeers'

vi.mock('@/api/backend', () => ({
  fetchPeers: vi.fn<typeof fetchPeers>(),
}))

const fetchPeersMock = vi.mocked(fetchPeers)

const peersFixture: PeersData = {
  peers: [{ peer_id: 'peer-1' }],
  pagination: { limit: 100, offset: 0, total: 1, has_more: false },
}

// usePeers relies on the component lifecycle (onMounted/onUnmounted), so it
// is tested inside a minimal host component. Only the timer APIs used by the
// composable are faked, keeping microtask-based flushPromises working.
function mountUsePeers(intervalMs?: number): {
  wrapper: VueWrapper
  peers: Ref<PeersData | null>
} {
  let peers!: Ref<PeersData | null>
  const Host = defineComponent({
    setup() {
      ;({ peers } = usePeers(intervalMs))
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, peers }
}

describe('usePeers', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    fetchPeersMock.mockResolvedValue(peersFixture)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('fetches peers immediately on mount', async () => {
    const { wrapper, peers } = mountUsePeers()
    await flushPromises()

    expect(fetchPeersMock).toHaveBeenCalledTimes(1)
    expect(peers.value).toEqual(peersFixture)

    wrapper.unmount()
  })

  it('polls again after the default 10 second interval', async () => {
    const { wrapper } = mountUsePeers()
    await flushPromises()
    expect(fetchPeersMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(9_999)
    expect(fetchPeersMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(fetchPeersMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('sets peers to null when a request fails', async () => {
    const { wrapper, peers } = mountUsePeers()
    await flushPromises()
    expect(peers.value).toEqual(peersFixture)

    fetchPeersMock.mockRejectedValueOnce(new Error('boom'))
    await vi.advanceTimersByTimeAsync(10_000)
    await flushPromises()

    expect(peers.value).toBeNull()

    wrapper.unmount()
  })

  it('stops polling after the component unmounts', async () => {
    const { wrapper } = mountUsePeers()
    await flushPromises()

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(fetchPeersMock).toHaveBeenCalledTimes(1)
  })

  it('respects a custom polling interval', async () => {
    const { wrapper } = mountUsePeers(1_000)
    await flushPromises()

    await vi.advanceTimersByTimeAsync(1_000)

    expect(fetchPeersMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })
})
