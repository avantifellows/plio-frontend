const { test, expect } = require("../fixtures/test");
const { provisionPublishedPlio } = require("../helpers/published-plio");

test("creator switches Home between workspace-specific plio lists", async ({
  page,
  request,
}) => {
  const primaryTitle = `E2E Workspace A ${Date.now()}`;
  const alternateTitle = `E2E Workspace B ${Date.now()}`;
  await provisionPublishedPlio({
    request,
    input: {
      title: primaryTitle,
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      videoDuration: 19,
      questions: [],
      workspace: "e2e",
    },
  });
  await provisionPublishedPlio({
    request,
    input: {
      title: alternateTitle,
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      videoDuration: 19,
      questions: [],
      workspace: "e2e-alt",
    },
  });

  await page.goto("/e2e/home");
  const homeList = page.locator('[data-test="table"]');

  await expect(homeList.getByText(primaryTitle, { exact: true })).toBeVisible();
  await expect(
    homeList.getByText(alternateTitle, { exact: true })
  ).toBeHidden();

  const alternatePliosResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/api/v1/plios/") &&
      response.request().method() === "GET"
  );
  await page
    .getByRole("combobox")
    .filter({
      has: page.getByRole("option", {
        name: "E2E Alternate Workspace",
        exact: true,
      }),
    })
    .selectOption("e2e-alt");

  expect((await alternatePliosResponse).ok()).toBe(true);
  await expect(page).toHaveURL(/\/e2e-alt\/home$/);
  await expect(homeList.getByText(primaryTitle, { exact: true })).toBeHidden();
  await expect(
    homeList.getByText(alternateTitle, { exact: true })
  ).toBeVisible();
});
