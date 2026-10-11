import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import type { HealthData } from '@/api/health'
import HealthInfo from '@/components/HealthInfo.vue'
import { useHealth } from '@/composables/useHealth'
import HomeView from '@/views/HomeView.vue'

vi.mock('@/composables/useHealth', () => ({
  useHealth: vi.fn<typeof useHealth>(),
}))

const healthFixture: HealthData = { status: 'ok', version: '1.2.3', uptime_seconds: 42 }

describe('HomeView', () => {
  it('passes the polled health data to HealthInfo', () => {
    vi.mocked(useHealth).mockReturnValue({ health: ref<HealthData | null>(healthFixture) })

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(HealthInfo).props('health')).toEqual(healthFixture)
  })

  it('passes null to HealthInfo while no data is available', () => {
    vi.mocked(useHealth).mockReturnValue({ health: ref<HealthData | null>(null) })

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(HealthInfo).props('health')).toBeNull()
  })
})
