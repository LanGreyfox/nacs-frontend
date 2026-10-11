import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The env module validates variables at import time, so each test re-imports
// the health module with a fresh module registry after stubbing env values.
async function importHealthModule() {
  vi.resetModules()
  return await import('../health')
}

describe('fetchHealth', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('resolves with the parsed health payload on success', async () => {
    const health = { status: 'ok', version: '1.2.3', uptime_seconds: 42 }
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => health,
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const { fetchHealth } = await importHealthModule()
    const result = await fetchHealth()

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/health')
    expect(result).toEqual(health)
  })

  it('throws a descriptive error on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as Response),
    )

    const { fetchHealth } = await importHealthModule()

    await expect(fetchHealth()).rejects.toThrow('503')
  })

  it('propagates network errors unchanged', async () => {
    const networkError = new TypeError('fetch failed')
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(networkError))

    const { fetchHealth } = await importHealthModule()

    await expect(fetchHealth()).rejects.toBe(networkError)
  })
})
