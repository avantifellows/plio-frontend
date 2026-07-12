---
name: conventions
description: How code is written in this project — naming, structure, patterns, and style. Load when writing new code or reviewing existing code.
triggers:
  - "convention"
  - "pattern"
  - "naming"
  - "style"
  - "how should I"
  - "what's the right way"
edges:
  - target: context/architecture.md
    condition: when a convention depends on understanding the system structure
last_updated: 2026-07-11
---

# Conventions

## Naming

- Vue single-file components and pages: PascalCase (`Editor.vue`, `Home.vue`)
- API service modules: PascalCase singular resource name (`Plio.js`, `Item.js`, `Session.js`) in `src/services/API`
- Vuex modules: lowercase file names (`auth.js`, `dialog.js`, `generic.js`, `selectors.js`, `sync.js`) in `src/store/modules`
- Unit tests mirror source paths under tests/unit and end in `.spec.js` (`App.spec.js`, pages/, components/)
- Env vars: `VUE_APP_*` prefix (required for Vue CLI to expose them to client code)

## Structure

- Route-level views live in `src/pages`; reusable pieces in `src/components` (grouped by feature: Editor, Player, UI, etc.)
- Every backend resource gets its own service module in `src/services/API` that imports paths from `Endpoints.js` and calls `apiClient()`
- Cross-cutting business helpers go in `src/services/Functional`, not in components
- Store state that must survive reload belongs in the persisted `auth` module; ephemeral UI state goes in `dialog`/`generic`
- Router guards and title handling are centralized in `src/router` — don't put auth checks in components

## Patterns

API access — always through the service layer:

```js
// Correct
import PlioService from "@/services/API/Plio.js";
const plio = await PlioService.getPlio(uuid);

// Wrong — bypasses auth/tenant interceptors
import axios from "axios";
await axios.get(`${backend}/plios/${uuid}/`);
```

Workspace-scoped requests — the `Organization` header comes from state, so set the
workspace before calling, never pass it manually:

```js
this.$store.dispatch("auth/setActiveWorkspace", workspaceShortcode);
// subsequent apiClient() calls now target that workspace's schema
```

User-facing text — through i18n, never literals:

```js
// Correct (template)
{{ $t("home.create_button") }}

// Wrong
Create Plio
```

## Verify Checklist

Before presenting any code:
- [ ] `npm run lint` passes (ESLint + eslint-plugin-vue)
- [ ] `npm run test:unit` passes; new logic in pages/components has a matching `.spec.js` under tests/unit
- [ ] No direct axios usage or hardcoded endpoint URLs — services + `Endpoints.js` only
- [ ] New user-visible strings added to locale files and referenced via `$t(...)`
- [ ] New env vars added to `.env.example` with `VUE_APP_` prefix
- [ ] Options API style maintained — no Composition API introduced
