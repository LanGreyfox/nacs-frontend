import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'

vi.mock('@/views/HomeView.vue', () => ({ default: { render: () => null } }))
vi.mock('@/views/LoginView.vue', () => ({ default: { render: () => null } }))

describe('router guard', () => {
  beforeEach(async () => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    vi.resetModules()
  })

  async function freshRouter() {
    const { default: router } = await import('@/router')
    await router.push('/')
    await router.isReady()
    return router
  }

  it('redirects unauthenticated users to login', async () => {
    const router = await freshRouter()

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows authenticated users to reach home', async () => {
    const router = await freshRouter()
    useAuthStore().login('alice', 'secret')

    await router.push('/')

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('redirects authenticated users away from login', async () => {
    const router = await freshRouter()
    useAuthStore().login('alice', 'secret')
    await router.push('/about')

    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('home')
  })
})
