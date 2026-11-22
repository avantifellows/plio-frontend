---
name: decisions
description: Key architectural and technical decisions with reasoning. Load when making design choices or understanding why something is built a certain way.
triggers:
  - "why do we"
  - "why is it"
  - "decision"
  - "alternative"
  - "we chose"
last_updated: 2026-11-22
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

### Lock learner playback speed at 1x
**Date:** 2026-11-22
**Status:** Active
**Decision:** The learner player (`src/pages/Embeds/Plio.vue` `plyrConfig`) leaves `speed` out of the Plyr settings menu and sets `speed: { selected: 1, options: [1] }`. For YouTube, Plyr limits the allowed speeds to `config.speed.options`, so any speed change is clamped to 1x.
**Reasoning:** Watch time adds 0.05 s on every 50 ms Plyr `timeupdate` tick, so it counts real seconds spent watching. At 1.5x or 2x it came out well below how much of the video was covered. The owner chose to remove the speed control instead of changing how watch time is counted.
**Consequences:** Learners can't rewatch faster. If speed control comes back, change watch time to count video seconds covered first, or sessions recorded at different speeds can't be compared.
