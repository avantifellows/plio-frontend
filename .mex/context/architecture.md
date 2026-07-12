---
name: architecture
description: How the major pieces of this project connect and flow. Load when working on system design, integrations, or understanding how components interact.
triggers:
  - "architecture"
  - "system design"
  - "how does X connect to Y"
  - "integration"
  - "flow"
edges:
  - target: context/stack.md
    condition: when specific technology details are needed
  - target: context/decisions.md
    condition: when understanding why the architecture is structured this way
last_updated: 2026-07-11
---

# Architecture

## System Overview

User action in a page component (`src/pages`) → calls a resource service in `src/services/API`
(Plio.js, Item.js, Session.js, …) → each service uses `apiClient()` from `RootClient.js` →
axios interceptors add `Authorization: Bearer <token>` and `Organization: <activeWorkspace>`
headers, normalise trailing slashes → request hits the plio-backend REST API →
response flows back to the component; shared state (auth, workspace, settings) lives in the
Vuex store. A 401 triggers the centralized re-auth flow in RootClient (refresh token → retry
original request; on failure → auto-logout). A store plugin (`usersWebSocketPlugin`) keeps a
WebSocket open to the backend for live user updates when authenticated.

## Key Components

- **`src/pages`** — route-level views: Login, Home (plio list), Editor (create/edit plios), Player (watch/answer), Dashboard (analytics), Error, and Embeds (embedded plio player)
- **`src/services/API`** — one client module per backend resource plus `RootClient.js` (axios instance + interceptors) and `Endpoints.js` (the single authoritative list of endpoint paths)
- **`src/services/Functional`** — business utilities used across components (items, user, video, settings logic)
- **`src/store`** — Vuex 4 store; modules: `auth` (tokens, user, activeWorkspace, settings), `dialog`, `generic`, `selectors`, `sync`; plugins include the users WebSocket plugin
- **`src/router`** — routes with guards: `requiresAuth`, `guest`, third-party SSO bypass (query `unique_id` + `api_key`), workspace param persistence, document titles
- **`src/services/Localisation`** — vue-i18n setup; locale JSON files live in `src/locales`

## External Dependencies

- plio-backend REST API (`VUE_APP_BACKEND`) — all data; multi-tenant, so the `Organization` header decides which workspace schema answers
- plio-backend OAuth endpoints (`VUE_APP_BACKEND_AUTH_URL`) — `/convert-token/` (Google → Plio token), `/token/` (refresh grant), `/generate-external-auth-access-token/` (third-party SSO)
- plio-backend WebSocket (`VUE_APP_BACKEND_WEBSOCKET`) — live user object updates at `/api/v1/users/<userId>`
- Google OAuth (via **vue3-google-oauth2**) — social login; needs `VUE_APP_GOOGLE_CLIENT_ID`
- Mixpanel (**mixpanel-browser**) and Sentry (**@sentry/browser**) — product analytics and error monitoring (staging/production)

## What Does NOT Exist Here

- No business/data logic — validation, permissions, tenancy, and metrics are all backend concerns; this app renders and forwards
- No server-side rendering and no backend-for-frontend — the SPA talks directly to the Django API
- No component library — UI is hand-built with Tailwind utility classes
