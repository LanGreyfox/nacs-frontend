import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'

const push = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

describe('LoginView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    push.mockReset()
    push.mockResolvedValue()
    setActivePinia(createPinia())
  })

  it('stores the credentials and navigates to home on submit', async () => {
    const wrapper = mount(LoginView)

    await wrapper.get('input[name="username"]').setValue('alice')
    await wrapper.get('input[name="password"]').setValue('secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(useAuthStore().credentials).toEqual({ username: 'alice', password: 'secret' })
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })
})
