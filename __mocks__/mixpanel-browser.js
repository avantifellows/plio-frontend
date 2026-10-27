// Permanent manual mock for mixpanel-browser (jest root-mocks convention,
// same mechanism as the axios/debounce/dom-to-image mocks in this directory).
//
// It replaces the real analytics library in every unit suite so that:
//   - the test bootstrap's `mixpanel.init(...)` and component `created()` hooks
//     never crash,
//   - no Mixpanel project token is needed under test, and
//   - no real analytics ever run.
//
// This stub is inert — nothing asserts on it. It only exists so mounts don't
// crash. Every method the app calls on mixpanel (and its `people` sub-object)
// is a no-op jest.fn().
export default {
  init: jest.fn(),
  identify: jest.fn(),
  alias: jest.fn(),
  reset: jest.fn(),
  register: jest.fn(),
  track: jest.fn(),
  get_distinct_id: jest.fn(),
  people: {
    set: jest.fn(),
    set_once: jest.fn(),
    increment: jest.fn(),
  },
};
