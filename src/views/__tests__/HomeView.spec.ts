import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import type { StatusData } from '@/api/backend'
import type { HealthData } from '@/api/health'
import HealthInfo from '@/components/HealthInfo.vue'
import StatusInfo from '@/components/StatusInfo.vue'
import { useHealth } from '@/composables/useHealth'
import { useStatus } from '@/composables/useStatus'
import HomeView from '@/views/HomeView.vue'

vi.mock('@/composables/useHealth', () => ({
  useHealth: vi.fn<typeof useHealth>(),
}))
vi.mock('@/composables/useStatus', () => ({
  useStatus: vi.fn<typeof useStatus>(),
}))

const healthFixture: HealthData = { status: 'ok', version: '1.2.3', uptime_seconds: 42 }
const statusFixture: StatusData = {
  sync: { is_active: false, current_transfer: null, queue_length: 0 },
  peers_connected: 2,
}

function mockComposables(health: HealthData | null, status: StatusData | null) {
  vi.mocked(useHealth).mockReturnValue({ health: ref<HealthData | null>(health) })
  vi.mocked(useStatus).mockReturnValue({ status: ref<StatusData | null>(status) })
}

describe('HomeView', () => {
  it('passes the polled health data to HealthInfo', () => {
    mockComposables(healthFixture, statusFixture)

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(HealthInfo).props('health')).toEqual(healthFixture)
  })

  it('passes null to HealthInfo while no data is available', () => {
    mockComposables(null, null)

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(HealthInfo).props('health')).toBeNull()
  })

  it('passes the polled status data to StatusInfo', () => {
    mockComposables(healthFixture, statusFixture)

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(StatusInfo).props('status')).toEqual(statusFixture)
  })

  it('passes null to StatusInfo while no data is available', () => {
    mockComposables(null, null)

    const wrapper = mount(HomeView)

    expect(wrapper.findComponent(StatusInfo).props('status')).toBeNull()
  })
})
