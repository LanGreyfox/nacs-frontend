import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { PeersData } from '@/api/backend'
import PeersInfo from '@/components/PeersInfo.vue'

const empty: PeersData = {
  peers: [],
  pagination: { limit: 100, offset: 0, total: 0, has_more: false },
}

const populated: PeersData = {
  peers: [
    { peer_id: 'peer-1', address: '10.0.0.5:3000' },
    { peer_id: 'peer-2', address: '10.0.0.6:3000', last_seen: null },
  ],
  pagination: { limit: 100, offset: 0, total: 2, has_more: false },
}

describe('PeersInfo', () => {
  it('shows placeholders when no peers data is available', () => {
    const wrapper = mount(PeersInfo, { props: { peers: null } })

    expect(wrapper.text()).toContain('Peers unavailable')
    expect(wrapper.find('.peers-row dd').text()).toBe('—')
    expect(wrapper.find('.peer-list').exists()).toBe(false)
    expect(wrapper.find('.peer-empty').exists()).toBe(false)
  })

  it('renders the peer count and the peer fields', () => {
    const wrapper = mount(PeersInfo, { props: { peers: populated } })

    expect(wrapper.text()).toContain('Peers available')
    expect(wrapper.find('.peers-row dd').text()).toBe('2 of 2')
    expect(wrapper.findAll('.peer-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('peer_id')
    expect(wrapper.text()).toContain('peer-1')
    expect(wrapper.text()).toContain('10.0.0.6:3000')
  })

  it('renders null peer values as a placeholder', () => {
    const wrapper = mount(PeersInfo, { props: { peers: populated } })

    expect(wrapper.text()).toContain('last_seen')
    expect(wrapper.text()).toContain('—')
  })

  it('shows a hint when the peer list is empty', () => {
    const wrapper = mount(PeersInfo, { props: { peers: empty } })

    expect(wrapper.text()).toContain('Peers available')
    expect(wrapper.find('.peers-row dd').text()).toBe('0 of 0')
    expect(wrapper.text()).toContain('No peers connected')
    expect(wrapper.find('.peer-list').exists()).toBe(false)
  })
})
