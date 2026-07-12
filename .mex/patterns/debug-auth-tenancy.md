---
name: debug-auth-tenancy
description: Diagnosing 401 loops, silent logouts, and wrong-workspace data — the two failure boundaries of this app.
triggers:
  - "401"
  - "logged out"
  - "auth loop"
  - "wrong workspace"
  - "empty list"
edges:
  - target: "context/architecture.md"
    condition: "for the full request/re-auth flow before digging in"
last_updated: 2026-07-11
---

# Debug Auth & Tenancy Issues

## Context
Two headers decide everything: `Authorization: Bearer <accessToken>` and
`Organization: <activeWorkspace>`. Both are injected by interceptors in
`src/services/API/RootClient.js` from the Vuex `auth` module. The 401 handler refreshes the
token and retries once; a failed refresh (400) auto-logs-out and blocks further requests.

## Steps
1. Reproduce with devtools Network tab open — inspect the failing request's two headers first.
2. Missing `Authorization` → check `auth.accessToken` in Vuex; if state looks stale, clear localStorage (persisted via secure-ls) and log in again.
3. Repeated 401 → the refresh grant is failing: verify `VUE_APP_BACKEND_API_CLIENT_ID/SECRET` match an OAuth2 application on the backend, and that `VUE_APP_BACKEND_AUTH_URL` is right.
4. Data missing/empty but 200 → almost always tenancy: `Organization` header absent or naming a workspace the user isn't a member of. Check `auth.activeWorkspace`.
5. SSO/embed flows → confirm `unique_id` + `api_key` query params reached the router guard (they bypass login and mint a token via `/generate-external-auth-access-token/`).

## Gotchas
- Persisted state hides bugs: a code fix may not help users whose localStorage still holds the old state shape — test with storage cleared.
- The WebSocket plugin reconnects on close; a backend restart can produce console noise that looks like an auth failure but isn't.
- 401 on the refresh call itself is expected to log the user out — that's the designed terminal state, not a bug.

## Verify
- [ ] Login → reload → still authenticated (persistence works)
- [ ] Expired token path: request → refresh → retry succeeds without user-visible error
- [ ] Workspace switch changes the `Organization` header on the next request

## Debug
If all else fails, add a temporary log in the request interceptor in `src/services/API/RootClient.js`
printing method, URL, and both headers — it is the single choke point for every call.

## Update Scaffold
- [ ] Update `.mex/ROUTER.md` "Current Project State" if what's working/not built has changed
- [ ] Update any `.mex/context/` files that are now out of date
- [ ] If this is a new task type without a pattern, create one in `.mex/patterns/` and add to `INDEX.md`
