const { test, expect } = require("../fixtures/test");
const {
  provisionPublishedPlio,
  stubYouTubeDuration,
} = require("../helpers/published-plio");

test("creator share link and embed render the published plio Player", async ({
  page,
  request,
}) => {
  await stubYouTubeDuration(page);
  const publishedPlio = await provisionPublishedPlio({
    request,
    input: {
      title: `E2E Share Embed ${Date.now()}`,
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      videoDuration: 19,
      questions: [
        {
          text: "What is being visited?",
          options: ["A zoo", "A museum"],
          correctAnswer: 0,
        },
      ],
    },
  });

  await page.goto(`/edit/${publishedPlio.uuid}`);
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) await languagePicker.click();
  await expect(page.locator('[data-test="videoLinkInput"] input')).toHaveValue(
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    {
      timeout: 30000,
    }
  );
  await page.locator('[data-test="sharePlioButton"]').click();

  const shareDialog = page.locator('[data-test="title"]', {
    hasText: "Share this Plio",
  });
  await expect(shareDialog).toBeVisible();
  const shareLink = page.getByText(new RegExp(`/play/${publishedPlio.uuid}$`));

  const loadedPlayer = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${publishedPlio.uuid}/play/`
      ) && response.request().method() === "GET"
  );
  await page.goto(`http://${await shareLink.textContent()}`);

  expect((await loadedPlayer).ok()).toBe(true);
  await expect(page).toHaveURL(new RegExp(`/play/${publishedPlio.uuid}$`));
  await expect(page.locator(`#plio${publishedPlio.uuid} .plyr`)).toBeVisible();

  await page.goto(`/edit/${publishedPlio.uuid}`);
  await expect(page.locator('[data-test="videoLinkInput"] input')).toHaveValue(
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    {
      timeout: 30000,
    }
  );
  await page.locator('[data-test="embedPlioButton"]').click();

  await expect(
    page.locator('[data-test="title"]', { hasText: "Embed this Plio" })
  ).toBeVisible();
  const embedCode = await page
    .locator('[data-test="codeWithoutSSO"] > div > p')
    .textContent();

  const loadedEmbed = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${publishedPlio.uuid}/play/`
      ) && response.request().method() === "GET"
  );
  await page.setContent(embedCode);

  expect((await loadedEmbed).ok()).toBe(true);
  const embed = page.locator(`iframe[src$="/plio/${publishedPlio.uuid}"]`);
  await expect(embed).toHaveAttribute(
    "src",
    new RegExp(`/plio/${publishedPlio.uuid}$`)
  );
  await expect(
    page
      .frameLocator(`iframe[src$="/plio/${publishedPlio.uuid}"]`)
      .locator(`#plio${publishedPlio.uuid} .plyr`)
  ).toBeVisible();
});
