const { test, expect } = require("../fixtures/test");
const { provisionPublishedPlio } = require("../helpers/published-plio");

const journey = {
  videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  videoDuration: 19,
  title: "Learner golden playback",
  questions: [
    {
      text: "Which option completes the journey?",
      options: ["The first option", "The second option"],
      correctAnswer: 1,
    },
  ],
};

async function drivePlayer(page, action, time) {
  await page
    .locator('[data-test="player-wrapper"]')
    .evaluate(
      (player, detail) =>
        player.dispatchEvent(new CustomEvent("plio-player-state", { detail })),
      { action, time }
    );
}

async function completeJourney(
  page,
  request,
  advanceToQuestion,
  finishPlayback
) {
  const plio = await provisionPublishedPlio({ page, request, input: journey });

  await page.goto(`/play/${plio.uuid}`);
  await expect(page.locator(`#plio${plio.uuid} .plyr`)).toBeVisible();
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) await languagePicker.click();

  await advanceToQuestion(page);
  await expect(page.locator('[data-test="questionText"]')).toHaveText(
    journey.questions[0].text
  );

  await page.locator('[data-test="optionSelector-1"]').click();
  const answerResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.includes("/api/v1/session-answers/") &&
      response.request().method() === "PUT"
  );
  await page.locator('[data-test="submitButton"]').click();
  expect((await answerResponse).ok()).toBe(true);
  await page.locator('[data-test="proceedButton"]').click();

  await finishPlayback(page);
  const scorecard = page.locator("#scorecardmodal");
  await expect(scorecard).toBeVisible({ timeout: 30000 });
  await expect(scorecard.getByText("Correct").locator("../..")).toContainText(
    "1"
  );
  await expect(scorecard.getByText("Wrong").locator("../..")).toContainText(
    "0"
  );
  await expect(scorecard.getByText("Skipped").locator("../..")).toContainText(
    "0"
  );
  await expect(scorecard).toContainText("100");
}

test("learner answers a timed question and sees the expected score", async ({
  page,
  request,
}) => {
  await completeJourney(
    page,
    request,
    (playerPage) => drivePlayer(playerPage, "seek", 0.75),
    (playerPage) => drivePlayer(playerPage, "ended")
  );
});

test("learner completes the journey with real video @real-playback", async ({
  page,
  request,
}) => {
  await completeJourney(
    page,
    request,
    (playerPage) => playerPage.locator(".plyr__control--overlaid").click(),
    () => Promise.resolve()
  );
});
