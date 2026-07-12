---
name: setup
description: Dev environment setup and commands. Load when setting up the project for the first time or when environment issues arise.
triggers:
  - "setup"
  - "install"
  - "environment"
  - "getting started"
  - "how do I run"
  - "local development"
edges:
  - target: context/stack.md
    condition: when specific technology versions or library details are needed
  - target: context/architecture.md
    condition: when understanding how components connect during setup
last_updated: 2026-07-11
---

# Setup

## Prerequisites

- Node.js + npm (project uses the Vue CLI webpack toolchain)
- A running plio-backend instance (default local: port 8001) — the app is unusable without the API
- Docker Desktop (optional — only for the dockerized dev flow in docker-compose.yml)
- pre-commit (`pip install pre-commit` or `brew install pre-commit`) for the git hooks

## First-time Setup

1. `npm install`
2. `cp .env.example .env` and fill in values (see Environment Variables below)
3. `pre-commit install` (dev only)
4. `npm run serve` — app on http://localhost:8080
5. Docker alternative: `docker-compose up -d --build` (uses `APP_PORT` from .env)

## Environment Variables

- `VUE_APP_BACKEND` (required) — backend REST base URL, e.g. http://localhost:8001/api/v1
- `VUE_APP_BACKEND_AUTH_URL` (required) — backend OAuth base (convert-token, token endpoints)
- `VUE_APP_BACKEND_API_CLIENT_ID` / `VUE_APP_BACKEND_API_CLIENT_SECRET` (required) — OAuth2 client credentials issued by the backend
- `VUE_APP_BACKEND_WEBSOCKET` (required) — ws(s):// base for live user updates
- `VUE_APP_FRONTEND` (required) — this app's own base URL
- `VUE_APP_GOOGLE_CLIENT_ID` / `VUE_APP_GOOGLE_API_KEY` (required for Google login)
- `VUE_APP_I18N_LOCALE` / `VUE_APP_I18N_FALLBACK_LOCALE` (optional) — default locales
- `VUE_APP_MIXPANEL_PROJECT_TOKEN` (optional) — analytics
- `VUE_APP_SENTRY_DSN` (optional) — error monitoring
- `APP_PORT` (docker only) — container port mapping

## Common Commands

- `npm run serve` — dev server with hot reload on port 8080
- `npm run test:unit` — Jest unit suite (tests/unit)
- `npm run lint` — ESLint via vue-cli-service
- `npm run build` — production build (`--modern`)
- `npm run build-staging` — staging-mode build
- `npm run deploy` / `npm run deploy-staging` — build + S3 sync (needs the `plio-s3-bot` AWS profile)
- `npm run i18n:report` — report missing/unused i18n keys

## Common Issues

**Blank app / all requests 401 or CORS errors:** the backend isn't running or `VUE_APP_BACKEND` points to the wrong port — local backend serves at port 8001, not 8000.
**Login loop after backend restart:** the persisted OAuth client credentials no longer match — verify `VUE_APP_BACKEND_API_CLIENT_ID/SECRET` against the backend's OAuth2 application and clear localStorage.
**e2e specs in tests/integration fail immediately:** expected — they need BrowserStack + Google OAuth credentials; there is no locally runnable e2e suite on main.
