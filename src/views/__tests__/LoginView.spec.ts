import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchStatus, HttpError } from '@/api/backend'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'

const push = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/api/backend', () => ({
  fetchStatus: vi.fn<typeof import('@/api/backend').fetchStatus>(),
  HttpError: class extends Error {
    status = 401
  },
}))

async function submit(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('input[name="username"]').setValue('alice')
  await wrapper.get('input[name="password"]').setValue('secret')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    push.mockReset()
    push.mockResolvedValue()
    vi.mocked(fetchStatus).mockReset()
    setActivePinia(createPinia())
  })

  it('stores the credentials and navigates to home after a successful status call', async () => {
    vi.mocked(fetchStatus).mockResolvedValue({
      sync: { is_active: false, current_transfer: null, queue_length: 0 },
      peers_connected: 0,
    })

    await submit(mount(LoginView))

    expect(fetchStatus).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
    expect(useAuthStore().credentials).toEqual({ username: 'alice', password: 'secret' })
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('shows an error and does not store credentials on 401', async () => {
    const unauthorized = new (HttpError as unknown as new () => Error)()
    vi.mocked(fetchStatus).mockRejectedValue(unauthorized)

    const wrapper = mount(LoginView)
    await submit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toBe('Invalid credentials')
    expect(useAuthStore().credentials).toBeNull()
    expect(push).not.toHaveBeenCalled()
  })

  it('shows a generic error when the backend is unreachable', async () => {
    vi.mocked(fetchStatus).mockRejectedValue(new TypeError('fetch failed'))

    const wrapper = mount(LoginView)
    await submit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toBe('Backend unreachable')
    expect(push).not.toHaveBeenCalled()
  })
})
