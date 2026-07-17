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

  // the app POSTs the learner session asynchronously after mount; driving
  // playback before it resolves races session-answer submission
  const sessionCreated = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.includes("/api/v1/sessions/") &&
      response.request().method() === "POST" &&
      response.ok()
  );
  await page.goto(`/play/${plio.uuid}`);
  await expect(page.locator(`#plio${plio.uuid} .plyr`)).toBeVisible();
  await sessionCreated;
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) await languagePicker.click();

  await advanceToQuestion(page);

  // late player-init timeupdates can close the item modal on slow runners
  // (checkForPopups closes any modal outside an item window), detaching
  // buttons mid-click. Re-driving the advance reopens the item —
  // checkItemPopup is purely time-window based, answered or not — so each
  // phase retries from a re-opened modal until its click lands.
  const questionText = page.locator('[data-test="questionText"]');
  const proceedButton = page.locator('[data-test="proceedButton"]');
  const answerResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.includes("/api/v1/session-answers/") &&
      response.request().method() === "PUT"
  );
  await expect(async () => {
    if (await proceedButton.isVisible()) return; // answer already submitted
    if (!(await questionText.isVisible())) await advanceToQuestion(page);
    await expect(questionText).toHaveText(journey.questions[0].text, {
      timeout: 2000,
    });
    await page
      .locator('[data-test="optionSelector-1"]')
      .click({ timeout: 2000 });
    await page.locator('[data-test="submitButton"]').click({ timeout: 2000 });
  }).toPass({ timeout: 45000 });
  expect((await answerResponse).ok()).toBe(true);
  await expect(async () => {
    if (!(await proceedButton.isVisible())) await advanceToQuestion(page);
    await proceedButton.click({ timeout: 2000 });
  }).toPass({ timeout: 30000 });

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
