const { getPlioAccessToken } = require("./auth");

async function readJson(response, action) {
  if (!response.ok()) {
    throw new Error(`${action} failed with ${response.status()}`);
  }
  return response.json();
}

async function provisionViaApi(request, input) {
  if (!input.videoDuration) {
    throw new Error("API provisioning requires videoDuration");
  }

  const { access_token: accessToken } = await getPlioAccessToken(request);
  const headers = { Authorization: `Bearer ${accessToken}` };
  if (input.workspace) headers.Organization = input.workspace;
  const backend = process.env.VUE_APP_BACKEND.replace(/\/$/, "");

  const plio = await readJson(
    await request.post(`${backend}/plios/`, { headers }),
    "Creating plio"
  );
  const video = await readJson(
    await request.post(`${backend}/videos/`, {
      headers,
      data: { url: input.videoUrl, duration: input.videoDuration },
    }),
    "Creating video"
  );
  await readJson(
    await request.patch(`${backend}/plios/${plio.uuid}/`, {
      headers,
      data: { name: input.title, video: video.id },
    }),
    "Saving plio"
  );

  for (const [index, question] of input.questions.entries()) {
    const item = await readJson(
      await request.post(`${backend}/items/`, {
        headers,
        data: {
          plio: plio.id,
          type: "question",
          time: index + 1,
          meta: { source: { name: "default" } },
        },
      }),
      "Creating item"
    );
    await readJson(
      await request.post(`${backend}/questions/`, {
        headers,
        data: {
          item: item.id,
          text: question.text,
          type: "mcq",
          options: question.options,
          correct_answer: question.correctAnswer,
          max_char_limit: 100,
        },
      }),
      "Creating question"
    );
  }

  await readJson(
    await request.patch(`${backend}/plios/${plio.uuid}/`, {
      headers,
      data: { status: "published" },
    }),
    "Publishing plio"
  );
  return readJson(
    await request.get(`${backend}/plios/${plio.uuid}/play/`, { headers }),
    "Loading published plio"
  );
}

async function provisionPublishedPlio({ page, request, input, via = "api" }) {
  if (via === "api") return provisionViaApi(request, input);
  if (via !== "ui") throw new Error(`Unknown provisioning mode: ${via}`);

  await page.goto("/home");
  const languagePicker = page.locator('[data-test="languagePicker-en"]');
  if (await languagePicker.isVisible()) {
    await languagePicker.click();
  }
  const createResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/api/v1/plios/") &&
      response.request().method() === "POST"
  );
  await page
    .locator('[data-test="create"]')
    .click();

  const response = await createResponse;
  if (!response.ok()) {
    throw new Error(`Creating plio failed with ${response.status()}`);
  }

  const { uuid } = await response.json();
  const editorResponse = page.waitForResponse(
    (editor) =>
      new URL(editor.url()).pathname.endsWith(`/api/v1/plios/${uuid}/`) &&
      editor.request().method() === "GET"
  );
  await page.waitForURL(new RegExp(`/edit/${uuid}$`));
  await editorResponse;
  await page.locator('[data-test="videoLinkInfo"]').waitFor();

  await page
    .locator('[data-test="videoLinkInput"] input')
    .fill(input.videoUrl);
  await page
    .locator('[data-test="videoPreview"] button[aria-label^="Play,"]')
    .first()
    .waitFor();

  const titleResponse = page.waitForResponse((plio) => {
    const request = plio.request();
    return (
      new URL(plio.url()).pathname.endsWith(`/api/v1/plios/${uuid}/`) &&
      request.method() === "PATCH" &&
      request.postDataJSON().name === input.title
    );
  });
  await page.locator('[data-test="plioName"] input').fill(input.title);
  const savedTitle = await titleResponse;
  if (!savedTitle.ok()) {
    throw new Error(`Saving title failed with ${savedTitle.status()}`);
  }

  const itemResponse = page.waitForResponse(
    (item) =>
      new URL(item.url()).pathname.endsWith("/api/v1/items/") &&
      item.request().method() === "POST"
  );
  const questionResponse = page.waitForResponse(
    (question) =>
      new URL(question.url()).pathname.endsWith("/api/v1/questions/") &&
      question.request().method() === "POST"
  );
  await page.locator('[data-test="addMCQItem"]').click();
  const [savedItem, createdQuestion] = await Promise.all([
    itemResponse,
    questionResponse,
  ]);
  if (!savedItem.ok() || !createdQuestion.ok()) {
    throw new Error("Creating question failed");
  }

  const question = input.questions[0];
  const editedQuestionResponse = page.waitForResponse((savedQuestion) => {
    const request = savedQuestion.request();
    const body = request.postDataJSON();
    return (
      new URL(savedQuestion.url()).pathname.includes("/api/v1/questions/") &&
      request.method() === "PUT" &&
      body.text === question.text &&
      body.options.join("|") === question.options.join("|")
    );
  });
  await page
    .locator('[data-test="questionText"] textarea')
    .fill(question.text);
  const optionInputs = page.locator('[data-test="option"] input');
  for (const [index, option] of question.options.entries()) {
    await optionInputs.nth(index).fill(option);
  }
  const editedQuestion = await editedQuestionResponse;
  if (!editedQuestion.ok()) {
    throw new Error(`Saving question failed with ${editedQuestion.status()}`);
  }

  const publishedResponse = page.waitForResponse((published) => {
    const request = published.request();
    return (
      new URL(published.url()).pathname.endsWith(`/api/v1/plios/${uuid}/`) &&
      request.method() === "PATCH" &&
      request.postDataJSON().status === "published"
    );
  });
  const publishedVideoResponse = page.waitForResponse(
    (video) =>
      new URL(video.url()).pathname.includes("/api/v1/videos/") &&
      ["POST", "PATCH"].includes(video.request().method())
  );
  await page.locator('[data-test="publishButton"]').click();
  await page
    .locator('[data-test="dialogBox"] [data-test="confirmButton"]')
    .click();
  const [published, publishedVideo] = await Promise.all([
    publishedResponse,
    publishedVideoResponse,
  ]);
  if (!published.ok() || !publishedVideo.ok()) {
    throw new Error("Publishing plio failed");
  }

  return { uuid, ...input };
}

module.exports = { provisionPublishedPlio };
