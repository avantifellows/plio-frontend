---
name: stack
description: Technology stack, library choices, and the reasoning behind them. Load when working with specific technologies or making decisions about libraries and tools.
triggers:
  - "library"
  - "package"
  - "dependency"
  - "which tool"
  - "technology"
edges:
  - target: context/decisions.md
    condition: when the reasoning behind a tech choice is needed
  - target: context/conventions.md
    condition: when understanding how to use a technology in this codebase
last_updated: 2026-07-11
---

# Stack

## Core Technologies

- **Vue 3** — framework, Options API style throughout (no Composition API refactor)
- **@vue/cli-service** — Vue CLI (webpack) build toolchain; dev server, build, lint, and unit tests all run through `vue-cli-service`
- **Vuex 4** — global state, persisted via `vuex-persistedstate` with `secure-ls` encryption
- **vue-router** (v4) — routing with per-route guards and workspace-aware params
- **TailwindCSS** — styling (postcss7-compat build), no component library

## Key Libraries

- **axios** — HTTP; always via the shared `apiClient()` in `src/services/API/RootClient.js`, never imported directly in components
- **vue-i18n** — all user-facing copy; locale JSONs in `src/locales` (report: `npm run i18n:report`)
- **plyr** — video player wrapped by the Player page components
- **vue3-google-oauth2** — Google login flow
- **mixpanel-browser** — product analytics events
- **@sentry/browser** + **@sentry/tracing** — error monitoring in staging/production
- **@vue/cli-plugin-unit-jest** + **@vue/test-utils** — Jest unit tests in tests/unit
- **vue-toastification**, **vue-tippy** — toasts and tooltips
- **mathlive** / **katex** — math input and rendering in questions

## What We Deliberately Do NOT Use

- No Composition API — codebase is consistently Options API; don't mix styles
- No direct axios imports in components — the RootClient interceptors are the only place auth/tenant headers are handled
- No CSS frameworks besides Tailwind and no scoped CSS conventions — utility classes in templates
- No TypeScript — plain JS with ESLint (`babel-eslint` parser)

## Version Constraints

- Vue CLI toolchain pins webpack-era plugin versions; upgrading any `@vue/cli-*` package should happen together, not piecemeal
- `@browserstack/testcafe` devDependencies remain on main for the legacy e2e suite in tests/integration
