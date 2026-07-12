---
name: agents
description: Always-loaded project anchor. Read this first. Contains project identity, non-negotiables, commands, and pointer to ROUTER.md for full context.
last_updated: 2026-07-11
---

# Plio Frontend

## What This Is
Vue 3 single-page app for Plio — a platform to create and watch interactive videos with questions, used by creators (edit/publish plios) and learners (play/answer).

## Non-Negotiables
- All API calls go through `apiClient()` from `src/services/API/RootClient.js` — never raw axios; interceptors add auth and tenant headers
- Endpoint URLs live only in `src/services/API/Endpoints.js` — components import from service modules, never hardcode URLs
- Never commit secrets — `.env` is gitignored; add new vars to `.env.example` as placeholders
- Tenant-scoped requests need `activeWorkspace` set in the Vuex `auth` module so the `Organization` header is sent
- User-facing strings go through vue-i18n locales, not hardcoded text

## Commands
- Dev server: `npm run serve` (port 8080)
- Unit tests: `npm run test:unit`
- Lint: `npm run lint`
- Build: `npm run build` (staging: `npm run build-staging`)

## Scaffold Growth
After meaningful work, run GROW:
- Ground: what changed in reality?
- Record: update `ROUTER.md` and relevant `context/` files
- Orient: create or update a `patterns/` runbook if this can recur
- Write: bump `last_updated` on changed scaffold files and run `mex log` when rationale matters

The scaffold grows from real work, not just setup. See the GROW step in `ROUTER.md` for details.

## Navigation
At the start of every session, read `ROUTER.md` before doing anything else.
For full project context, patterns, and task guidance — everything is there.
