# NACS Frontend

Frontend for the **Network Attached Client Storage (NACS)** — a single-page application built with Vue 3, Vite and TypeScript. It communicates with the NACS backend API, whose base URL is provided via environment variables (see below).

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vue Router](https://router.vuejs.org/) + [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) (type checking via `vue-tsc`)
- Unit tests with [Vitest](https://vitest.dev/), end-to-end tests with [Playwright](https://playwright.dev)
- Linting with [oxlint](https://oxc.rs/docs/guide/usage/linter.html) + [ESLint](https://eslint.org/), formatting with [Prettier](https://prettier.io/)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed). TypeScript cannot handle type information for `.vue` imports by default, so Volar makes the editor's language service aware of `.vue` types, while `vue-tsc` (`npm run type-check`) is used for type checking on the CLI.

## Environment Variables

Environment-specific configuration is provided via Vite [env files and modes](https://vite.dev/guide/env-and-mode). Only variables prefixed with `VITE_` are exposed to the client bundle.

| File | Loaded when | Committed |
| --- | --- | --- |
| `.env.development` | `npm run dev` | yes |
| `.env.production` | `npm run build` / `npm run preview` | yes |
| `.env.development.local` / `.env.production.local` | same mode, overrides the above | no (gitignored) |
| `.env.example` | template documenting all variables | yes |

Available variables:

- `VITE_API_BASE_URL` (required): base URL of the NACS backend API. Local development points to `http://10.0.0.178:3000` (see `.env.development`).

Access variables in code only through the typed config module, never via `import.meta.env` directly:

```ts
import { env } from '@/config/env'

const response = await fetch(`${env.apiBaseUrl}/health`)
```

Missing or empty required variables throw an error at app startup. Local overrides and secrets belong in `.env.*.local` files, which are gitignored.

## Authentication

The API requires Basic Authentication. Users sign in on `/login` (`src/views/LoginView.vue`); the credentials are kept in `sessionStorage` by the auth store (`src/stores/auth.ts`) and are cleared when the tab is closed. A router guard in `src/router/index.ts` redirects unauthenticated users to `/login` and authenticated users away from it.

The credentials are not yet verified against the API and not yet sent with API calls.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Type-Check Only

```sh
npm run type-check
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- e2e/vue.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with oxlint + [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)

```sh
npm run format
```
