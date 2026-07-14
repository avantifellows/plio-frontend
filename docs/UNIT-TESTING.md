# Unit testing

The unit suite is [jest 26](https://jestjs.io/) + [Vue Test Utils](https://test-utils.vuejs.org/), run through vue-cli. Specs live under `tests/unit`.

## The one command

Run the whole suite from the project root:

```sh
npm run test:unit
```

That is the single documented command, and it must be green before you push. `package-lock.json` is the lockfile of record and CI installs with `npm install`, so `npm run test:unit` reproduces the CI unit job locally. No environment variables are required — Mixpanel is permanently mocked under test (see below), so no analytics token is needed and no analytics ever run.

## What green looks like

All suites collect and run. A small set of tests is temporarily skipped with `it.skip` and a comment pointing at the repair sub-issue that owns each one (drifted tests being repaired under [#379](https://github.com/avantifellows/plio-backend/issues/379)). Skipped tests are expected; failures are not.

## Notes for maintainers

- **`jest-mock-axios` is pinned to exact `4.5.0`** (no caret) in `package.json`, and `package-lock.json` resolves `4.5.0`. Do not widen this to a range: `4.6.1+` imports `@jest/globals` at module top level, which is fatal under jest 26 and kills every suite at collection (the root axios auto-mock in `__mocks__/axios.js` pulls it into every suite that touches the API client).
- **Mixpanel is mocked permanently** via `__mocks__/mixpanel-browser.js` (jest root-mocks convention, same mechanism as the axios/debounce/dom-to-image mocks). The stub is inert — nothing asserts on it; it exists so `mixpanel.init(...)` and component `created()` hooks don't crash under test.
- **prism-es6 is transpiled** via `transformIgnorePatterns: ["/node_modules/(?!prism-es6)"]` in `jest.config.js`; it ships untranspiled ESM that jest 26 cannot parse, which would otherwise break the `App.vue` import chain.
