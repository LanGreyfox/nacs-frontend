import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The env module validates variables at import time, so re-import with a fresh registry.
async function importBackendModule() {
  vi.resetModules()
  return await import('../backend')
}

function okResponse(body: unknown) {
  return { ok: true, json: async () => body } as Response
}

describe('backend api', () => {
  beforeEach(async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test')
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('fetchStatus uses explicit credentials for the Basic header', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(okResponse({ peers_connected: 1 }))
    vi.stubGlobal('fetch', fetchMock)

    const { fetchStatus } = await importBackendModule()
    const result = await fetchStatus({ username: 'alice', password: 'secret' })

    expect(result).toEqual({ peers_connected: 1 })
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/v1/status', {
      headers: { Authorization: `Basic ${btoa('alice:secret')}` },
    })
  })

  it('uses the stored credentials and omits undefined params', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(okResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    const { fetchPeers, fetchFiles } = await importBackendModule()
    const { useAuthStore } = await import('@/stores/auth')
    useAuthStore().login('bob', 'pw')

    await fetchPeers({ limit: 10, offset: 0 })
    await fetchFiles({ kind: 'create', path_prefix: 'docs/' })

    const header = { headers: { Authorization: `Basic ${btoa('bob:pw')}` } }
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/api/v1/peers?limit=10&offset=0',
      header,
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://api.test/api/v1/files?kind=create&path_prefix=docs%2F',
      header,
    )
  })

  it('encodes non-ASCII credentials as UTF-8', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(okResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    const { fetchStatus } = await importBackendModule()
    await fetchStatus({ username: 'jörg', password: 'pw' })

    const expected = btoa(String.fromCharCode(...new TextEncoder().encode('jörg:pw')))
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({
      headers: { Authorization: `Basic ${expected}` },
    })
  })

  it('throws an HttpError carrying the status on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response),
    )

    const { fetchStatus, HttpError } = await importBackendModule()
    const error = await fetchStatus({ username: 'a', password: 'b' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as InstanceType<typeof HttpError>).status).toBe(401)
  })

  it('throws when no credentials are available', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>())

    const { fetchPeers } = await importBackendModule()

    await expect(fetchPeers()).rejects.toThrow('Not authenticated')
  })
})
