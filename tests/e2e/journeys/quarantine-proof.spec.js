const { test, expect } = require("../fixtures/test");

test("deliberately failing quarantine proof @quarantine", () => {
  expect(true).toBe(false);
});
