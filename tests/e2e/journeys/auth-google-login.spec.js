const { test, expect } = require("../fixtures/test");

test("authenticated user lands on Home", async ({ page }) => {
  const pliosResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/api/v1/plios/") &&
      response.request().method() === "GET"
  );

  await page.goto("/home");

  expect((await pliosResponse).ok()).toBe(true);
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.locator('[data-test="table"], [data-test="noPlio"]')
  ).toBeVisible();
});
