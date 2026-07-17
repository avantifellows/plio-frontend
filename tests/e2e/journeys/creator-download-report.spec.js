const { execFileSync } = require("child_process");
const { test, expect } = require("../fixtures/test");
const { provisionPublishedPlio } = require("../helpers/published-plio");
const { dismissLanguageDialog } = require("../helpers/language-dialog");

test("creator downloads a well-formed report for a published plio with no learner sessions", async ({
  page,
  request,
}) => {
  const input = {
    title: `E2E Download Report ${Date.now()}`,
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    videoDuration: 19,
    questions: [
      {
        text: "What is being visited?",
        options: ["A zoo", "A museum"],
        correctAnswer: 0,
      },
    ],
  };
  const publishedPlio = await provisionPublishedPlio({ request, input });

  await page.goto("/home");
  await dismissLanguageDialog(page);
  const plioRow = page.locator('[data-test="row"]', { hasText: input.title });
  await plioRow.locator('[data-test="toggleButton"]').click();

  const plioResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${publishedPlio.uuid}/`
      ) && response.request().method() === "GET"
  );
  const metricsResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${publishedPlio.uuid}/metrics/`
      ) && response.request().method() === "GET"
  );
  await plioRow.locator('[data-test="option-analyse"]').click();
  const [loadedPlio, loadedMetrics] = await Promise.all([
    plioResponse,
    metricsResponse,
  ]);

  expect(loadedPlio.ok()).toBe(true);
  expect(loadedMetrics.ok()).toBe(true);
  await expect(page).toHaveURL(new RegExp(`/analyse/${publishedPlio.uuid}$`));
  await expect(page.getByText(input.title, { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.locator('[data-test="download"]').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(
    `plio-data-${publishedPlio.uuid}.zip`
  );
  const reportPath = await download.path();
  const metadata = execFileSync(
    "unzip",
    ["-p", reportPath, "plio-meta-details.csv"],
    { encoding: "utf8" }
  ).trim();
  expect(metadata).toBe(
    `id,name,video\n${publishedPlio.uuid},${input.title},${input.videoUrl}`
  );
});
