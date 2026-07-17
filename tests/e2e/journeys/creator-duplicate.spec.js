const { test, expect } = require("../fixtures/test");
const {
  provisionPublishedPlio,
  stubYouTubeDuration,
} = require("../helpers/published-plio");

async function expectEditorShowsQuestion(
  page,
  { videoUrl, title, questionText }
) {
  await expect(
    page.locator('[data-test="videoLinkInput"] input')
  ).toHaveValue(videoUrl, { timeout: 30000 });
  await expect(page.locator('[data-test="plioName"] input')).toHaveValue(
    title,
    { timeout: 30000 }
  );
  const itemMarker = page.locator('[data-test="marker-0"]');
  await expect(itemMarker).toBeVisible();
  // selecting a marker is idempotent, but a single click can land while
  // the editor is still wiring item handlers and be silently ignored —
  // retry the selection until the item editor actually opens
  await expect(async () => {
    await itemMarker.dispatchEvent("click");
    await expect(
      page.locator('[data-test="questionText"] textarea')
    ).toHaveValue(questionText, { timeout: 3000 });
  }).toPass({ timeout: 45000 });
}

test("creator duplicates a published plio without changing the original", async ({
  page,
  request,
}) => {
  await stubYouTubeDuration(page);
  const input = {
    title: `E2E Duplicate ${Date.now()}`,
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
  const source = await provisionPublishedPlio({ request, input });

  await page.goto("/home");
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) await languagePicker.click();
  const sourceRow = page.locator('[data-test="row"]', {
    hasText: input.title,
  });
  await sourceRow.locator('[data-test="toggleButton"]').click();

  const duplicatedResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(
        `/api/v1/plios/${source.uuid}/duplicate/`
      ) && response.request().method() === "POST"
  );
  await sourceRow.locator('[data-test="option-duplicate"]').click();
  const duplicated = await duplicatedResponse;
  expect(duplicated.ok()).toBe(true);
  const copy = await duplicated.json();

  expect(copy.uuid).not.toBe(source.uuid);
  await expect(page).toHaveURL(new RegExp(`/edit/${copy.uuid}$`));
  await expectEditorShowsQuestion(page, {
    videoUrl: input.videoUrl,
    title: input.title,
    questionText: input.questions[0].text,
  });
  await expect(page.getByText("Draft", { exact: true })).toBeVisible();
  const options = page.locator('[data-test="option"] input');
  await expect(options.nth(0)).toHaveValue(input.questions[0].options[0]);
  await expect(options.nth(1)).toHaveValue(input.questions[0].options[1]);

  const copyQuestionText = "What is the copied plio visiting?";
  const copyQuestionResponse = page.waitForResponse((response) => {
    const saved = response.request();
    return (
      new URL(response.url()).pathname.includes("/api/v1/questions/") &&
      saved.method() === "PUT" &&
      saved.postDataJSON().text === copyQuestionText
    );
  });
  await page
    .locator('[data-test="questionText"] textarea')
    .fill(copyQuestionText);
  expect((await copyQuestionResponse).ok()).toBe(true);

  await page.goto(`/edit/${source.uuid}`);
  await expectEditorShowsQuestion(page, {
    videoUrl: input.videoUrl,
    title: input.title,
    questionText: input.questions[0].text,
  });
});
