import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'

import { fetchHealth, type HealthData } from '@/api/health'
import { useHealth } from '@/composables/useHealth'

vi.mock('@/api/health', () => ({
  fetchHealth: vi.fn<typeof fetchHealth>(),
}))

const fetchHealthMock = vi.mocked(fetchHealth)

const healthFixture: HealthData = { status: 'ok', version: '1.2.3', uptime_seconds: 42 }

// useHealth relies on the component lifecycle (onMounted/onUnmounted), so it
// is tested inside a minimal host component. Only the timer APIs used by the
// composable are faked, keeping microtask-based flushPromises working.
function mountUseHealth(intervalMs?: number): {
  wrapper: VueWrapper
  health: Ref<HealthData | null>
} {
  let health!: Ref<HealthData | null>
  const Host = defineComponent({
    setup() {
      ;({ health } = useHealth(intervalMs))
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, health }
}

describe('useHealth', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    fetchHealthMock.mockResolvedValue(healthFixture)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('fetches health immediately on mount', async () => {
    const { wrapper, health } = mountUseHealth()
    await flushPromises()

    expect(fetchHealthMock).toHaveBeenCalledTimes(1)
    expect(health.value).toEqual(healthFixture)

    wrapper.unmount()
  })

  it('polls again after the default 10 second interval', async () => {
    const { wrapper } = mountUseHealth()
    await flushPromises()
    expect(fetchHealthMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(9_999)
    expect(fetchHealthMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(fetchHealthMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('sets health to null when a request fails', async () => {
    const { wrapper, health } = mountUseHealth()
    await flushPromises()
    expect(health.value).toEqual(healthFixture)

    fetchHealthMock.mockRejectedValueOnce(new Error('boom'))
    await vi.advanceTimersByTimeAsync(10_000)
    await flushPromises()

    expect(health.value).toBeNull()

    wrapper.unmount()
  })

  it('stops polling after the component unmounts', async () => {
    const { wrapper } = mountUseHealth()
    await flushPromises()

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(fetchHealthMock).toHaveBeenCalledTimes(1)
  })

  it('respects a custom polling interval', async () => {
    const { wrapper } = mountUseHealth(1_000)
    await flushPromises()

    await vi.advanceTimersByTimeAsync(1_000)

    expect(fetchHealthMock).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })
})
