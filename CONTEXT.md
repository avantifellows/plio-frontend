# Plio Frontend

The Vue 3 single-page app for Plio — creators build and analyze interactive video lessons, learners play them and answer questions. This context covers the SPA's own vocabulary; the domain entities (plio, item, question, session) are defined by the backend and shared — see plio-backend's CONTEXT.md for their full definitions.

## Language

### Product surfaces

**Player**:
The page where a learner watches a plio: video playback, timed question popups, answer submission, and resume. Also served inside iframes via the Embed route.
_Avoid_: viewer, watch page

**Editor**:
The creator's authoring page: video URL, items on a timeline, question editing, publish, settings, share/embed.
_Avoid_: builder, studio

**Home**:
The signed-in landing page listing the active workspace's plios with their analytics summary.
_Avoid_: dashboard (that's the per-plio analytics view), plio list

**Dashboard**:
The per-plio analytics view (metrics + report download), reached from Home.
_Avoid_: analytics page, home

**Embed**:
The route that renders a plio's Player inside a third-party page via iframe.
_Avoid_: widget

### Data & tenancy

**Active workspace**:
The Vuex `auth` value naming the workspace every API call is scoped to — it becomes the `Organization` header via the interceptors. Switching it re-scopes Home, Editor, and Player data.
_Avoid_: current org, tenant (in UI language)

**Workspace switch**:
Changing the active workspace from the UI; a first-class user journey (one of the 9 e2e journeys).
_Avoid_: org change

### Services & plumbing

**Resource service**:
One module per backend resource under `src/services/API` (Plio.js, Item.js, Session.js, …) — the only place components get data from.
_Avoid_: api wrapper, client (for individual modules)

**apiClient**:
The shared axios instance from `RootClient.js`; its interceptors add the Bearer token and `Organization` header and normalise paths. All API calls go through it — never raw axios.
_Avoid_: axios (as if used directly), http client

**Re-auth flow**:
RootClient's centralized 401 handling: refresh the token, retry the original request, auto-logout on failure.
_Avoid_: token refresh (for the whole flow), relogin

**SSO bypass**:
The router guard path that logs a learner in from `unique_id` + `api_key` query params (third-party entry), skipping the login page.
_Avoid_: external auth, api login

### Testing (decided vocabulary, map #362)

**Unit suite**:
The jest 26 + vue-test-utils suite under `tests/unit`, run with `npm run test:unit`. Deliberately kept on the frozen jest 26 toolchain — reviving it needs no build-tooling upgrade (decision #365).
_Avoid_: component tests (as a separate thing), spec suite

**E2E journey**:
A Playwright browser test driving one of the 9 inventoried user journeys through the full stack (workstream #380).
_Avoid_: integration test (this repo has no integration lane; that word belongs to the backend's API-journey suite)

**Floor**:
The committed coverage minimum CI fails under; frontend-unit gets its own floor file and Codecov flag (#368). Only moves up.
_Avoid_: threshold, target

## Relationships

- A **Player**/**Editor**/**Home** page component calls **resource services**, which all ride **apiClient**; shared state (auth, **active workspace**, settings) lives in the Vuex store
- The **active workspace** decides which schema the backend answers from — one header, set by the interceptor, drives all tenancy
- A 401 anywhere triggers the **re-auth flow**; a store plugin keeps a WebSocket open for live user updates while authenticated
- The **unit suite** tests components/store/services in isolation with mocked axios; **e2e journeys** exercise the real stack (own workstream, #380)
- Mixpanel and Sentry initialise from env tokens; under test, mixpanel is permanently mocked and analytics never run (decision #365)

## Example dialogue

> **Dev:** "The learner opened a plio from an org link and the **Player** 404s, but it plays fine for me."
> **Domain expert:** "Check the **active workspace** — their entry came through the **SSO bypass**, so the `Organization` header scopes them to that org's schema. Your session is probably scoped to the personal workspace where that plio doesn't exist."

> **Dev:** "Should I add the new report endpoint URL in the Dashboard component?"
> **Domain expert:** "No — endpoint paths live only in `Endpoints.js`, and the Dashboard should call a **resource service** method that uses **apiClient**."

## Flagged ambiguities

- **"plio"** names the product, both repos, and the entity — qualify when it matters ("a plio", "plio-frontend").
- **"Integration tests"** — this frontend has no integration lane; backend "integration" means API-journey tests. Use **E2E journey** for browser tests.
- **Home vs Dashboard** — both show analytics; Home is the workspace's plio list, Dashboard is one plio's detail view. Say which.
- **Teacher/Student** appear in some old copy and analytics events; the decided terms are **creator/learner**.
