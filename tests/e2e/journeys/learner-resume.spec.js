const { test, expect } = require("../fixtures/test");
const { provisionPublishedPlio } = require("../helpers/published-plio");

const resumeTime = 6;
const journey = {
  videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  videoDuration: 19,
  title: "Learner resume",
  questions: [],
};

async function openPlayer(page, uuid) {
  const sessionResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/api/v1/sessions/") &&
      response.request().method() === "POST"
  );
  await page.goto(`/play/${uuid}`);
  await expect(page.locator(`#plio${uuid} .plyr`)).toBeVisible();
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) await languagePicker.click();
  expect((await sessionResponse).ok()).toBe(true);
}

async function drivePlayer(page, action, time) {
  await page
    .locator('[data-test="player-wrapper"]')
    .evaluate(
      (player, detail) =>
        player.dispatchEvent(new CustomEvent("plio-player-state", { detail })),
      { action, time }
    );
}

function waitForEvent(page, type) {
  return page.waitForResponse((response) => {
    const eventRequest = response.request();
    return (
      new URL(response.url()).pathname.endsWith("/api/v1/events/") &&
      eventRequest.method() === "POST" &&
      eventRequest.postDataJSON().type === type
    );
  });
}

test("learner resumes at the saved position after reopening the plio", async ({
  page,
  request,
}) => {
  const plio = await provisionPublishedPlio({ page, request, input: journey });
  await openPlayer(page, plio.uuid);

  const savedPosition = waitForEvent(page, "video_seeked");
  await drivePlayer(page, "seek", resumeTime);
  expect((await savedPosition).ok()).toBe(true);

  await openPlayer(page, plio.uuid);
  await expect(page.locator(".plyr__time--current")).toHaveText("00:06", {
    timeout: 30000,
  });
});

test("learner resumes after watching real video @real-playback", async ({
  page,
  request,
}) => {
  const plio = await provisionPublishedPlio({ page, request, input: journey });
  await openPlayer(page, plio.uuid);

  await page.locator(".plyr__control--overlaid").click();
  await expect(page.locator(".plyr__time--current")).toHaveText("00:06", {
    timeout: 30000,
  });
  const savedPosition = waitForEvent(page, "paused");
  await page.locator('.plyr__controls [data-plyr="play"]').click();
  expect((await savedPosition).ok()).toBe(true);

  await openPlayer(page, plio.uuid);
  await expect(page.locator(".plyr__time--current")).toHaveText("00:06", {
    timeout: 30000,
  });
});
