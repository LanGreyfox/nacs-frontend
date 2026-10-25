import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import type { FilesData } from '@/api/backend'
import FilesInfo from '@/components/FilesInfo.vue'

const empty: FilesData = {
  resources: [],
  tombstones: [],
  pagination: { limit: 100, offset: 0, total: 0, has_more: false },
}

const populated: FilesData = {
  resources: [
    { path: '/', kind: 'folder', size: 0, checksum: null, updated_at: '2026-09-13T07:50:23Z' },
    { path: '/dump', kind: 'folder', size: 0, checksum: null, updated_at: '2026-09-13T07:50:23Z' },
    {
      path: '/dump/a.log',
      kind: 'file',
      size: 2048,
      checksum: 'abc',
      updated_at: '2026-09-13T07:50:23Z',
    },
    {
      path: '/b.txt',
      kind: 'file',
      size: 12,
      checksum: 'def',
      updated_at: '2026-09-13T07:50:23Z',
    },
  ],
  tombstones: [],
  pagination: { limit: 100, offset: 0, total: 4, has_more: false },
}

describe('FilesInfo', () => {
  it('shows placeholders when no files data is available', () => {
    const wrapper = mount(FilesInfo, { props: { files: null } })

    expect(wrapper.text()).toContain('Files unavailable')
    expect(wrapper.find('.files-row dd').text()).toBe('—')
    expect(wrapper.find('.file-tree').exists()).toBe(false)
    expect(wrapper.find('.files-empty').exists()).toBe(false)
  })

  it('shows an empty state when there are no files', () => {
    const wrapper = mount(FilesInfo, { props: { files: empty } })

    expect(wrapper.text()).toContain('Files available')
    expect(wrapper.find('.files-empty').text()).toBe('No files')
  })

  it('shows no sentinel when everything is loaded', () => {
    const wrapper = mount(FilesInfo, { props: { files: populated } })

    expect(wrapper.find('.files-sentinel').exists()).toBe(false)
  })

  it('emits load-more when the sentinel becomes visible', async () => {
    let callback!: IntersectionObserverCallback
    const observe = vi.fn<(el: Element) => void>()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe = observe
        disconnect = vi.fn<() => void>()
      },
    )

    const files: FilesData = {
      ...populated,
      pagination: { ...populated.pagination, total: 10, has_more: true },
    }
    const wrapper = mount(FilesInfo, { props: { files } })
    await nextTick()

    expect(wrapper.find('.files-sentinel').exists()).toBe(true)
    expect(observe).toHaveBeenCalledTimes(1)

    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    vi.unstubAllGlobals()
  })

  it('renders folders and files as a tree', () => {
    const wrapper = mount(FilesInfo, { props: { files: populated } })

    expect(wrapper.find('.files-row dd').text()).toBe('4 of 4')
    expect(wrapper.findAll('details')).toHaveLength(1)
    expect(wrapper.find('summary').text()).toBe('dump/')
    expect(wrapper.text()).toContain('a.log')
    expect(wrapper.text()).toContain('2.0 KB')
    expect(wrapper.text()).toContain('b.txt')
  })
})
