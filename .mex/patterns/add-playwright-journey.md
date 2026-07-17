---
name: add-playwright-journey
description: Add a browser-level E2E journey to the Playwright suite.
triggers:
  - "Playwright journey"
  - "e2e journey"
edges:
  - target: "context/conventions.md"
    condition: "when writing or reviewing the journey"
last_updated: 2026-07-17
---

# Add Playwright Journey

## Context
Journey specs live in `tests/e2e/journeys` and test only browser-visible behavior and the app's own network responses.

## Steps
1. Import `test` and `expect` from `tests/e2e/fixtures/test.js` so analytics stays blocked.
2. Name the spec after the journey inventory entry and map it in `tests/e2e/journeys.json`.
3. Anchor waits on Playwright locators or `waitForResponse`; never use elapsed time.
4. Assert DOM, URL, downloads, or state re-observed through the UI. Do not read Vuex or component internals.

## Gotchas
- `auth.setup.js` must remain a dependency of authenticated Chromium journeys.
- Local backend OAuth client credentials must match the frontend `.env` values.
- After navigation, wait for a browser-visible loaded state before typing; the API response can arrive before Vue finishes hydrating reactive inputs.
- When behavior depends on the latest session event, await the initial `watching` response before driving a later event so request ordering cannot overwrite the test state.
- The locale and workspace controls both use `data-test="select"`; locate the workspace combobox by one of its visible options.
- Published-plio helpers can create several videos with one URL; seed code must not assume that URL is unique.

## Verify
- [ ] `npm run test:e2e -- <journey-name>` passes headless
- [ ] `npm run lint` passes, including the scoped `waitForTimeout` ban
- [ ] CI's manifest gate counts the journey green from its Playwright JSON result

## Update Scaffold
- [ ] Update `.mex/ROUTER.md` if the implemented journey count changed
- [ ] Update relevant `.mex/context/` facts if setup or tooling changed
