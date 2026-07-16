const { test, expect } = require("../fixtures/test");

test.use({ storageState: { cookies: [], origins: [] } });

test("learner enters the Player through SSO", async ({ page }) => {
  const visitedPaths = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      visitedPaths.push(new URL(frame.url()).pathname);
    }
  });
  const tokenResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        "/auth/generate-external-auth-access-token/"
      ) && response.request().method() === "POST"
  );
  const plioResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        "/api/v1/plios/e2e-sso-plio/play/"
      ) && response.request().method() === "GET"
  );
  const sessionResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/api/v1/sessions/") &&
      response.request().method() === "POST"
  );

  await page.goto(
    "/e2e/play/e2e-sso-plio?unique_id=e2e-sso-learner&api_key=plio-e2e-api-key"
  );

  expect((await tokenResponse).ok()).toBe(true);
  expect((await plioResponse).ok()).toBe(true);
  expect((await sessionResponse).ok()).toBe(true);
  await expect(page).toHaveURL(/\/e2e\/play\/e2e-sso-plio/);
  await expect(page.locator("#plioe2e-sso-plio .plyr")).toBeVisible();
  expect(visitedPaths).not.toContain("/login");
});
