import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('is unauthenticated by default', () => {
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('stores credentials in state and sessionStorage on login', () => {
    const auth = useAuthStore()

    auth.login('alice', 'secret')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.credentials).toEqual({ username: 'alice', password: 'secret' })
    expect(JSON.parse(sessionStorage.getItem('nacs-credentials')!)).toEqual({
      username: 'alice',
      password: 'secret',
    })
  })

  it('restores credentials from sessionStorage', () => {
    sessionStorage.setItem('nacs-credentials', JSON.stringify({ username: 'bob', password: 'pw' }))

    expect(useAuthStore().credentials).toEqual({ username: 'bob', password: 'pw' })
  })

  it('clears state and sessionStorage on logout', () => {
    const auth = useAuthStore()
    auth.login('alice', 'secret')

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem('nacs-credentials')).toBeNull()
  })
})
