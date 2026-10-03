import { afterEach, describe, expect, it, vi } from 'vitest'

// The env module validates variables at import time, so each test re-imports
// it with a fresh module registry after stubbing the desired env values.
async function importEnvModule() {
  vi.resetModules()
  return await import('../env')
}

describe('env config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('exposes the API base URL from VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://10.0.0.178:3000')

    const { env } = await importEnvModule()

    expect(env.apiBaseUrl).toBe('http://10.0.0.178:3000')
  })

  it('throws a descriptive error when VITE_API_BASE_URL is missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined)

    await expect(importEnvModule()).rejects.toThrow('VITE_API_BASE_URL')
  })

  it('throws a descriptive error when VITE_API_BASE_URL is empty', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '   ')

    await expect(importEnvModule()).rejects.toThrow('VITE_API_BASE_URL')
  })

  it('exposes the Vite mode flags', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://10.0.0.178:3000')

    const { env } = await importEnvModule()

    expect(env.mode).toBe(import.meta.env.MODE)
    expect(env.isDev).toBe(import.meta.env.DEV)
    expect(env.isProd).toBe(import.meta.env.PROD)
  })

  it('returns a frozen env object', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://10.0.0.178:3000')

    const { env } = await importEnvModule()

    expect(Object.isFrozen(env)).toBe(true)
  })
})
