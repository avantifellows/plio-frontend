---
name: add-page
description: Adding a new route-level page with router guards, workspace params, and i18n.
triggers:
  - "new page"
  - "new route"
  - "add screen"
edges:
  - target: "context/conventions.md"
    condition: "for naming and structure rules before writing the component"
last_updated: 2026-07-11
---

# Add a Page / Route

## Context
Pages live in `src/pages` (PascalCase .vue). Routes, guards (`requiresAuth`, `guest`,
SSO bypass), workspace param handling, and document titles are all centralized in `src/router`.

## Steps
1. Create the page component in `src/pages` — Options API, Tailwind utilities for styling.
2. Register the route in `src/router`; follow the existing pattern of an optional `:workspace?` prefix for tenant-scoped pages.
3. Set route `meta` (auth requirement, title key) instead of doing checks inside the component.
4. Add all user-visible strings to the locale JSONs in `src/locales` and reference with `$t(...)`.
5. Add a spec under tests/unit/pages mirroring the page name (`.spec.js`).

## Gotchas
- Auth checks belong in router guards via `meta`, not in `mounted()` — the guards also handle the third-party SSO bypass (`unique_id` + `api_key` query params), which component-level checks would break.
- The router injects the remembered `activeWorkspace` into route params when absent — deep links must tolerate both `/home` and `/<workspace>/home` shapes.
- Missing locale keys render raw key paths in the UI; run `npm run i18n:report` to catch them.

## Verify
- [ ] Route works authenticated and redirects correctly when logged out
- [ ] Route works with and without a `:workspace` param
- [ ] Strings resolve in both locales (`npm run i18n:report` clean for the new keys)
- [ ] Unit spec added and `npm run test:unit` passes

## Debug
- Redirect loop → conflicting `requiresAuth`/`guest` meta on the route
- Wrong workspace data after navigation → workspace param and store `activeWorkspace` out of sync

## Update Scaffold
- [ ] Update `.mex/ROUTER.md` "Current Project State" if what's working/not built has changed
- [ ] Update any `.mex/context/` files that are now out of date
- [ ] If this is a new task type without a pattern, create one in `.mex/patterns/` and add to `INDEX.md`
