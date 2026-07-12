---
name: decisions
description: Key architectural and technical decisions with reasoning. Load when making design choices or understanding why something is built a certain way.
triggers:
  - "why do we"
  - "why is it"
  - "decision"
  - "alternative"
  - "we chose"
last_updated: 2026-07-11
---

# Decisions

## Decision Log

### Centralize all HTTP concerns in RootClient interceptors
**Date:** 2021 (original architecture, verified 2026-07-11)
**Status:** Active
**Decision:** One axios instance (`apiClient()` in `src/services/API/RootClient.js`) owns auth headers, the `Organization` tenant header, URL normalisation, and the 401 refresh-and-retry flow.
**Reasoning:** Multi-tenancy and token refresh are easy to get wrong per-call; a single choke point means components can't forget a header.
**Alternatives considered:** Per-service axios instances (rejected — duplicated interceptor logic and drift).
**Consequences:** Any new API call must go through the service layer; bypassing it silently loses tenancy and re-auth behaviour.

### Encode the active workspace as state, not as a call parameter
**Date:** 2021 (original architecture, verified 2026-07-11)
**Status:** Active
**Decision:** The current workspace shortcode lives in the Vuex `auth` module (`activeWorkspace`); the interceptor injects it as the `Organization` header on every request. Routes carry an optional `:workspace` param that syncs with the store.
**Reasoning:** Matches the backend's django-tenants model where the header selects the Postgres schema; keeps components tenant-agnostic.
**Consequences:** Tests and embeds must set `activeWorkspace` (or use personal workspace default) before making tenant-scoped calls.

### Persist auth state with vuex-persistedstate + secure-ls
**Date:** 2021 (original architecture, verified 2026-07-11)
**Status:** Active
**Decision:** Vuex state (tokens, user, workspace) survives reloads via `vuex-persistedstate`, encrypted in localStorage through `secure-ls`.
**Reasoning:** SPA reloads shouldn't log users out; plain localStorage would expose tokens.
**Consequences:** Auth-state shape changes are effectively migrations — stale persisted state in users' browsers must be handled.
