# NACS Frontend — Agent Guidelines

Frontend for the **Network Attached Client Storage (NACS)**: a Vue 3 + Vite + TypeScript single-page application that talks to the NACS backend API. See [README.md](README.md) for setup, environment variables, and scripts.

## Language

- **All code, comments, and documentation must be written in English.** This includes identifiers, test descriptions, commit messages, and markdown files — regardless of the language used in chat.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Type-check: `npm run type-check` (vue-tsc)
- Unit tests: `npm run test:unit -- run` (Vitest + jsdom)
- Lint: `npm run lint` (oxlint --fix, then eslint --fix)
- Format: `npm run format` (Prettier)
- Build: `npm run build` · E2E tests: `npm run test:e2e` (Playwright)

Verify changes with `npm run type-check`, `npm run test:unit -- run`, and `npm run lint` before considering a task done.

## Conventions

- **Environment access**: only via the typed config module `src/config/env.ts` (`env.apiBaseUrl`) — never `import.meta.env` directly. It validates fail-fast at import time; `VITE_API_BASE_URL` is required.
- **HTTP**: native `fetch`, no axios. API modules live in `src/api/`, with their types defined directly in the module (e.g. `HealthData` in `src/api/health.ts`).
- **Import alias**: `@/` maps to `src/` (configured in `vite.config.ts` + `tsconfig.app.json`).
- **Structure**: composables in `src/composables/`, Pinia stores in `src/stores/`, routes in `src/router/`, views in `src/views/`, reusable components in `src/components/`.
- **Authentication**: the backend needs Basic Auth. `useAuthStore` (`src/stores/auth.ts`) stores username/password in `sessionStorage`; the `beforeEach` guard in `src/router/index.ts` sends unauthenticated users to `login`. Credentials are not yet verified or attached to API calls (planned).
- **Backend**: dev API at `http://10.0.0.178:3000` (`.env.development`); `GET /health` returns `{ status, version, uptime_seconds }`.

## Testing

- Vitest + jsdom; unit tests live in `__tests__/` folders next to the code they cover.
- Env-dependent modules: use `vi.stubEnv` + `vi.resetModules()` + dynamic import (see `src/config/__tests__/env.spec.ts`).
- Mock `fetch` via `vi.stubGlobal`. The oxlint rule `vitest/require-mock-type-parameters` requires type parameters on `vi.fn()`, e.g. `vi.fn<typeof fetch>()`; cast partial Response mocks with `as Response`.
- Lifecycle-dependent composables: mount a host component with `defineComponent` + `h()` render (no `template:` string — Vite uses the runtime-only build without a compiler) via @vue/test-utils.
- Fake timers: `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })` — leave `setImmediate` real, otherwise `flushPromises()` hangs.
- Router guard tests: `vi.resetModules()` + dynamic import of `@/router`, with a fresh Pinia via `setActivePinia(createPinia())` and the view components mocked (see `src/router/__tests__/index.spec.ts`).
- Mock modules in composable/view tests via `vi.mock('@/api/health', ...)` or `vi.mock('@/composables/useHealth', ...)`; use `vi.mocked()` for type safety.
