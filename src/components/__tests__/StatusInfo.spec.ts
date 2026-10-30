import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { StatusData } from '@/api/backend'
import StatusInfo from '@/components/StatusInfo.vue'

const idle: StatusData = {
  sync: { is_active: false, current_transfer: null, queue_length: 3 },
  peers_connected: 2,
}

const longPeerId = '12D3KooWFBgZUVvMFZHFvZqFd2B7EGxuZ6kFWxrosob2xDtbJA9N'

describe('StatusInfo', () => {
  it('shows placeholders when no status is available', () => {
    const wrapper = mount(StatusInfo, { props: { status: null } })

    expect(wrapper.text()).toContain('Status unavailable')
    expect(wrapper.find('.transfer').exists()).toBe(false)
  })

  it('renders sync state, queue length and peers', () => {
    const wrapper = mount(StatusInfo, { props: { status: idle } })

    expect(wrapper.text()).toContain('Status available')
    expect(wrapper.text()).toContain('Idle')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.find('.transfer').exists()).toBe(false)
  })

  it('renders the current transfer with progress', () => {
    const wrapper = mount(StatusInfo, {
      props: {
        status: {
          sync: {
            is_active: true,
            queue_length: 0,
            current_transfer: {
              path: '/a/b.txt',
              peer_id: longPeerId,
              event_kind: 'upload',
              progress_bytes: 512,
              total_bytes: 2048,
              username: 'alice',
            },
          },
          peers_connected: 1,
        },
      },
    })

    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('/a/b.txt')
    expect(wrapper.text()).toContain(longPeerId)
    expect(wrapper.findAll('.peer-id wbr')).toHaveLength(Math.ceil(longPeerId.length / 12) - 1)
    expect(wrapper.text()).toContain('512 B / 2.0 KiB (25%)')
  })
})
