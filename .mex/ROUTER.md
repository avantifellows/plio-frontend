---
name: router
description: Session bootstrap and navigation hub. Read at the start of every session before any task. Contains project state, routing table, and behavioural contract.
edges:
  - target: context/architecture.md
    condition: when working on system design, integrations, or understanding how components connect
  - target: context/stack.md
    condition: when working with specific technologies, libraries, or making tech decisions
  - target: context/conventions.md
    condition: when writing new code, reviewing code, or unsure about project patterns
  - target: context/decisions.md
    condition: when making architectural choices or understanding why something is built a certain way
  - target: context/setup.md
    condition: when setting up the dev environment or running the project for the first time
  - target: patterns/INDEX.md
    condition: when starting a task — check the pattern index for a matching pattern file
last_updated: 2026-07-17
---

# Session Bootstrap

If you haven't already read `AGENTS.md`, read it now — it contains the project identity, non-negotiables, and commands.

Then read this file fully before doing anything else in this session.

## Current Project State

**Working:**

- Creator flow: login → create/edit plio in Editor → add items and questions → publish
- Learner flow: Player page plays video, shows questions at timestamps, records sessions/answers/events
- Auth: Google OAuth, OTP login, and third-party SSO (query params `unique_id` + `api_key`)
- Multi-workspace support via `activeWorkspace` and the `Organization` request header
- Dashboard analytics page; jest unit specs exist (~40 files under tests/unit) but see Known issues — the suite is red in CI
- Playwright scaffold plus all 9 inventoried E2E journeys run locally with `npm run test:e2e`; frontend PRs call the reusable sharded ephemeral-stack workflow; a committed manifest gates actual shard results and reports N/9 beside branch pairing; evidence-based `@quarantine` failures are reported separately but non-blocking, while nightly/manual runs treat them as blocking; `npm run seed:e2e` idempotently provisions backend fixtures

**Not yet built:**

- No #380 implementation slices remain; final review passed and only the PR step is pending

**Known issues:**

- Vue CLI toolchain (webpack) is legacy; no migration to Vite is planned or started
- Unit suite red in CI since Aug 2025 (poisoned jest-mock-axios 4.7.3 in lockfile kills collection); revival planned as plio-backend#379 sub-issues #393–#398 (pin 4.5.0, mixpanel stub, prism-es6 transform, 17 test repairs, Codecov v5, CI-enforced coverage floor)

## Routing Table

Load the relevant file based on the current task. Always load `context/architecture.md` first if not already in context this session.

| Task type                          | Load                                             |
| ---------------------------------- | ------------------------------------------------ |
| Understanding how the system works | `context/architecture.md`                        |
| Working with a specific technology | `context/stack.md`                               |
| Writing or reviewing code          | `context/conventions.md`                         |
| Making a design decision           | `context/decisions.md`                           |
| Setting up or running the project  | `context/setup.md`                               |
| Any specific task                  | Check `patterns/INDEX.md` for a matching pattern |

## Behavioural Contract

For every task, follow this loop:

1. **CONTEXT** — Load the relevant context file(s) from the routing table above. Check `patterns/INDEX.md` for a matching pattern. If one exists, follow it. Narrate what you load: "Loading architecture context..."
2. **BUILD** — Do the work. If a pattern exists, follow its Steps. If you are about to deviate from an established pattern, say so before writing any code — state the deviation and why.
3. **VERIFY** — Load `context/conventions.md` and run the Verify Checklist item by item. State each item and whether the output passes. Do not summarise — enumerate explicitly.
4. **DEBUG** — If verification fails or something breaks, check `patterns/INDEX.md` for a debug pattern. Follow it. Fix the issue and re-run VERIFY.
5. **GROW** — After meaningful work, run this binary checklist:
   - **Ground:** What changed in reality? Name the changed behavior, system, command, dependency, or workflow.
   - **Record:** If project state changed, update the "Current Project State" section above. If documented facts changed, update the relevant `context/` file surgically.
   - **Orient:** If this task can recur and no pattern exists, create one in `patterns/` using `patterns/README.md`, then add it to `patterns/INDEX.md`. If a pattern exists but you learned a gotcha, update it.
   - **Write:** Bump `last_updated` in every scaffold file you changed. If the why matters, run `mex log --type decision "<what changed and why>"` or `mex log "<note>"`.
