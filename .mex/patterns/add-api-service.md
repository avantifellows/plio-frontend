---
name: add-api-service
description: Adding a new backend resource client to the API service layer, or a new call to an existing one.
triggers:
  - "new endpoint"
  - "api call"
  - "service module"
edges:
  - target: "context/architecture.md"
    condition: "when unsure how the service layer fits the request flow"
last_updated: 2026-07-11
---

# Add an API Service Call

## Context
All HTTP goes through `apiClient()` from `src/services/API/RootClient.js`. Endpoint path
strings live only in `src/services/API/Endpoints.js`. One module per backend resource
(`Plio.js`, `Item.js`, `Session.js`, …).

## Steps
1. Add the endpoint path to `src/services/API/Endpoints.js` (or reuse an existing resource root).
2. Create/extend the resource module in `src/services/API` — export named async functions that call `apiClient().get/post/patch/delete`.
3. Components import the service function; never call `apiClient()` directly from a component.
4. If the response needs unwrapping/reshaping (like `Plio.js` does with `itemDetails`), do it in the service so components get a stable shape.

## Gotchas
- RootClient appends a trailing slash to URLs — Django requires it; don't hand-build URLs with query strings in the path (pass `params` instead).
- The `Organization` header comes from `activeWorkspace` state — a "missing data" bug is often a missing/wrong workspace, not a broken endpoint.
- The refresh-token call itself must not carry the Bearer header; RootClient already special-cases it — don't route auth-token calls through a resource service.

## Verify
- [ ] No component imports axios or hardcodes a URL
- [ ] Endpoint string exists only in `Endpoints.js`
- [ ] Works in a workspace context (with `activeWorkspace` set) and in personal workspace (unset)
- [ ] `npm run lint` and `npm run test:unit` pass

## Debug
- 404 with doubled/missing slashes → check the path in `Endpoints.js`; RootClient normalises but can't fix a wrong root
- 401 loop → see the auth/tenancy debug pattern
- Data from the wrong workspace → log the `Organization` header in the request interceptor

## Update Scaffold
- [ ] Update `.mex/ROUTER.md` "Current Project State" if what's working/not built has changed
- [ ] Update any `.mex/context/` files that are now out of date
- [ ] If this is a new task type without a pattern, create one in `.mex/patterns/` and add to `INDEX.md`
