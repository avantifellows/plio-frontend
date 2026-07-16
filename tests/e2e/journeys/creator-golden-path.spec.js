const { test, expect } = require("../fixtures/test");
const {
  provisionPublishedPlio,
  stubYouTubeDuration,
} = require("../helpers/published-plio");

test("creator creates a plio with a question and publishes it", async ({
  page,
  request,
}) => {
  await stubYouTubeDuration(page);
  const input = {
    title: `E2E Golden Path ${Date.now()}`,
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    questions: [
      {
        text: "Which word describes this video?",
        options: ["Historic", "Silent"],
        correctAnswer: 0,
      },
    ],
  };

  const publishedPlio = await provisionPublishedPlio({
    page,
    request,
    input,
    via: "ui",
  });

  await expect(page).toHaveURL(new RegExp(`/edit/${publishedPlio.uuid}$`));
  await expect(
    page.locator('[data-test="videoLinkInput"] input')
  ).toHaveValue(input.videoUrl);
  await expect(page.locator('[data-test="videoPreview"]')).toBeVisible();
  await expect(page.locator('[data-test="plioName"] input')).toHaveValue(
    input.title
  );
  await expect(
    page.locator('[data-test="questionText"] textarea')
  ).toHaveValue(input.questions[0].text);
  const options = page.locator('[data-test="option"] input');
  await expect(options.nth(0)).toHaveValue(input.questions[0].options[0]);
  await expect(options.nth(1)).toHaveValue(input.questions[0].options[1]);
  await expect(page.locator('[data-test="publishedDialog"]')).toBeVisible();

  const playerResponse = page.context().waitForEvent("response", {
    predicate: (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${publishedPlio.uuid}/play/`
      ) && response.request().method() === "GET",
  });
  const playerPagePromise = page.waitForEvent("popup");
  await page.locator('[data-test="publishedDialogPlayButton"]').click();
  const [playerPage, loadedPlayer] = await Promise.all([
    playerPagePromise,
    playerResponse,
  ]);

  expect(loadedPlayer.ok()).toBe(true);
  await expect(playerPage).toHaveURL(
    new RegExp(`/play/${publishedPlio.uuid}$`)
  );
  await expect(
    playerPage.locator(`#plio${publishedPlio.uuid} .plyr`)
  ).toBeVisible();
});

test("published plio helper provisions through the app API", async ({
  request,
}) => {
  const input = {
    title: `E2E API Published ${Date.now()}`,
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

  expect(publishedPlio.name).toBe(input.title);
  expect(publishedPlio.status).toBe("published");
  expect(publishedPlio.items[0].details.text).toBe(input.questions[0].text);
});
